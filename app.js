// NutriSnap - Core Web Application logic

// ==========================================
// 1. STATE INITIALIZATION & MANAGEMENT
// ==========================================
let state = {
  userProfile: {
    name: 'Alex Johnson',
    activity: 'Active',
    weight: 78,
    height: 175,
    targetWeight: 75
  },
  goals: {
    calories: 2000,
    water: 8,
    macros: {
      protein: 30, // % of calories
      carbs: 45,   // % of calories
      fat: 25      // % of calories
    }
  },
  history: {}, // Keyed by YYYY-MM-DD
  currentDate: ''
};

// Available charts instances
let calorieChart = null;
let macroChart = null;

// Temporary variable to store currently uploaded base64 image
let currentUploadedImageBase64 = null;

// Initialize app when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  initDate();
  loadState();
  setupNavigation();
  setupEventListeners();
  initDashboard();
  loadPresets();
  lucide.createIcons();
});

// Set current date string
function initDate() {
  const today = new Date();
  state.currentDate = today.toISOString().split('T')[0];
  
  // Format long date for UI header
  const options = { weekday: 'long', month: 'short', day: 'numeric' };
  document.getElementById('current-date-text').textContent = today.toLocaleDateString('en-US', options);
}

// Load state from LocalStorage or seed with mock data
function loadState() {
  const savedProfile = localStorage.getItem('nutrisnap_profile');
  const savedGoals = localStorage.getItem('nutrisnap_goals');
  const savedHistory = localStorage.getItem('nutrisnap_history');
  
  if (savedProfile && savedGoals && savedHistory) {
    state.userProfile = JSON.parse(savedProfile);
    state.goals = JSON.parse(savedGoals);
    state.history = JSON.parse(savedHistory);
  } else {
    // Seed database if empty
    state.history = generateMockHistory();
    saveState();
  }
  
  // Ensure today exists in history
  if (!state.history[state.currentDate]) {
    state.history[state.currentDate] = {
      meals: [],
      water: 0
    };
    saveState();
  }
  
  // Sync Settings forms with active state
  syncSettingsUI();
}

// Save active state to LocalStorage
function saveState() {
  localStorage.setItem('nutrisnap_profile', JSON.stringify(state.userProfile));
  localStorage.setItem('nutrisnap_goals', JSON.stringify(state.goals));
  localStorage.setItem('nutrisnap_history', JSON.stringify(state.history));
}

// ==========================================
// 2. NAVIGATION AND SPA VIEW ROUTER
// ==========================================
function setupNavigation() {
  const navButtons = document.querySelectorAll('.nav-btn');
  
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.getAttribute('data-view');
      switchView(view);
    });
  });
  
  // Header Log Meal Quick button
  document.getElementById('header-quick-log').addEventListener('click', () => {
    switchView('log-meal');
  });
}

function switchView(viewName) {
  // Update nav button classes
  document.querySelectorAll('.nav-btn').forEach(btn => {
    if (btn.getAttribute('data-view') === viewName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // Update view panel visibility
  document.querySelectorAll('.view-panel').forEach(panel => {
    if (panel.id === `${viewName}-view`) {
      panel.classList.add('active');
    } else {
      panel.classList.remove('active');
    }
  });
  
  // Update view headers dynamically
  const titleEl = document.getElementById('view-title');
  const subtitleEl = document.getElementById('view-subtitle');
  
  if (viewName === 'dashboard') {
    titleEl.textContent = `Welcome back, ${state.userProfile.name}`;
    subtitleEl.textContent = "Here's your nutritional overview for today.";
    initDashboard();
  } else if (viewName === 'log-meal') {
    titleEl.textContent = 'Meal Log Center';
    subtitleEl.textContent = 'Upload photos, log calories, and keep track of your daily intake.';
    clearMealForm();
  } else if (viewName === 'analytics') {
    titleEl.textContent = 'Nutrition Analytics';
    subtitleEl.textContent = 'Detailed breakdown of calorie cycles and macro consistency.';
    setTimeout(initAnalyticsCharts, 50); // Small timeout to ensure canvas width is rendered
  } else if (viewName === 'coach') {
    titleEl.textContent = 'AI Nutrition Coach';
    subtitleEl.textContent = 'Get real-time insights, recipe recommendations, and weekly reviews.';
    initCoachingPanel();
  } else if (viewName === 'settings') {
    titleEl.textContent = 'System & Diet Settings';
    subtitleEl.textContent = 'Configure calorie budgets, nutrient allocations, and reset state.';
    syncSettingsUI();
  }
}

// ==========================================
// 3. DASHBOARD RENDERING & HYDRATION
// ==========================================
function initDashboard() {
  const todayData = state.history[state.currentDate] || { meals: [], water: 0 };
  
  // 1. Compute Daily Totals
  let totalCal = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  
  todayData.meals.forEach(meal => {
    totalCal += Number(meal.calories) || 0;
    totalProtein += Number(meal.protein) || 0;
    totalCarbs += Number(meal.carbs) || 0;
    totalFat += Number(meal.fat) || 0;
  });
  
  // 2. Render Calorie Ring UI
  const calGoal = state.goals.calories;
  const remaining = Math.max(0, calGoal - totalCal);
  
  document.getElementById('calories-eaten').textContent = totalCal.toLocaleString();
  document.getElementById('calories-remaining').textContent = remaining.toLocaleString();
  document.getElementById('dashboard-calorie-goal').textContent = `Goal: ${calGoal.toLocaleString()} kcal`;
  
  // Calculate Exercise (Simulate a consistent daily passive burn or customizable card - let's set a realistic passive burn)
  const passiveBurn = 250; 
  document.getElementById('calories-burned').textContent = passiveBurn;
  
  // Calculate percentage for progress ring
  // perimeter is 465
  const pct = Math.min(100, (totalCal / calGoal) * 100);
  const ringBar = document.getElementById('calorie-progress-bar');
  const dashoffset = 465 - (465 * pct) / 100;
  ringBar.style.strokeDashoffset = dashoffset;
  
  // Change ring colors dynamically if goal exceeded
  const ringGradientStart = document.querySelector('#calorieGradient stop:first-child');
  const ringGradientEnd = document.querySelector('#calorieGradient stop:last-child');
  if (totalCal > calGoal) {
    ringGradientStart.setAttribute('stop-color', '#EF4444');
    ringGradientEnd.setAttribute('stop-color', '#DC2626');
    document.getElementById('calories-remaining').style.color = '#EF4444';
    document.querySelector('.calorie-text-overlay .label').textContent = 'kcal over';
    document.getElementById('calories-remaining').textContent = Math.abs(calGoal - totalCal).toLocaleString();
  } else {
    ringGradientStart.setAttribute('stop-color', '#10B981');
    ringGradientEnd.setAttribute('stop-color', '#059669');
    document.getElementById('calories-remaining').style.color = 'inherit';
    document.querySelector('.calorie-text-overlay .label').textContent = 'kcal left';
  }
  
  // 3. Render Macros Bars
  // Calculate macro targets in grams
  // Protein: 4 kcal per gram. Carbs: 4 kcal per gram. Fat: 9 kcal per gram.
  const targetProteinGrams = Math.round((calGoal * (state.goals.macros.protein / 100)) / 4);
  const targetCarbsGrams = Math.round((calGoal * (state.goals.macros.carbs / 100)) / 4);
  const targetFatGrams = Math.round((calGoal * (state.goals.macros.fat / 100)) / 9);
  
  document.getElementById('protein-ratio').textContent = `${totalProtein}g / ${targetProteinGrams}g`;
  document.getElementById('carbs-ratio').textContent = `${totalCarbs}g / ${targetCarbsGrams}g`;
  document.getElementById('fats-ratio').textContent = `${totalFat}g / ${targetFatGrams}g`;
  
  // Update progress bars
  const protPct = Math.min(100, (totalProtein / targetProteinGrams) * 100);
  const carbPct = Math.min(100, (totalCarbs / targetCarbsGrams) * 100);
  const fatPct = Math.min(100, (totalFat / targetFatGrams) * 100);
  
  document.getElementById('protein-progress-bar').style.width = `${protPct}%`;
  document.getElementById('carbs-progress-bar').style.width = `${carbPct}%`;
  document.getElementById('fats-progress-bar').style.width = `${fatPct}%`;
  
  // Dynamic Macro status text
  const macroTextEl = document.getElementById('macro-status-text');
  if (totalCal === 0) {
    macroTextEl.textContent = 'No meals logged';
    macroTextEl.style.color = 'var(--text-muted)';
  } else {
    const deviation = Math.abs(protPct - carbPct) + Math.abs(protPct - fatPct);
    if (deviation < 30) {
      macroTextEl.textContent = 'Perfect Balance';
      macroTextEl.style.color = 'var(--primary-color)';
    } else if (protPct < 50) {
      macroTextEl.textContent = 'Need Protein';
      macroTextEl.style.color = 'var(--color-warning)';
    } else {
      macroTextEl.textContent = 'Macros Logging';
      macroTextEl.style.color = 'var(--accent-coach)';
    }
  }
  
  // 4. Hydration Goals
  const waterGoal = state.goals.water;
  const currentWater = todayData.water || 0;
  document.getElementById('water-goal-text').textContent = `${waterGoal} Cups`;
  document.getElementById('water-display').textContent = `${currentWater} / ${waterGoal} cups`;
  
  const waterPct = Math.min(100, (currentWater / waterGoal) * 100);
  document.getElementById('water-fluid-level').style.height = `${waterPct}%`;
  
  // 5. Meals List Cards
  renderTodayMealsList('all');
}

// Render Meal List Cards with Optional Category Filter
function renderTodayMealsList(filter = 'all') {
  const container = document.getElementById('today-meals-container');
  const todayData = state.history[state.currentDate] || { meals: [], water: 0 };
  
  // Remove existing meal cards
  const existingCards = container.querySelectorAll('.meal-item-card');
  existingCards.forEach(c => c.remove());
  
  // Filter meals
  const filteredMeals = todayData.meals.filter(meal => filter === 'all' || meal.category === filter);
  
  if (filteredMeals.length === 0) {
    document.getElementById('no-meals-placeholder').style.display = 'flex';
    return;
  }
  
  document.getElementById('no-meals-placeholder').style.display = 'none';
  
  filteredMeals.forEach(meal => {
    const card = document.createElement('div');
    card.className = 'glass-card meal-item-card';
    
    // Choose beautiful image placeholder if upload does not exist
    let bgStyle = '';
    if (meal.image && meal.image.startsWith('data:image')) {
      bgStyle = `background-image: url(${meal.image})`;
    } else {
      const gradient = PRESET_GRADIENTS[meal.category] || PRESET_GRADIENTS['default'];
      bgStyle = `background: ${gradient}`;
    }
    
    card.innerHTML = `
      <div class="meal-card-image-box" style="${bgStyle}">
        <span class="meal-card-meta-pill">${meal.category}</span>
        <button class="btn-delete-meal" data-id="${meal.id}" aria-label="Delete Meal">
          <i data-lucide="trash-2"></i>
        </button>
      </div>
      <div class="meal-card-body">
        <div>
          <h4>${meal.name}</h4>
          <span class="meal-card-time"><i data-lucide="clock"></i> logged at ${meal.time || '12:00'}</span>
        </div>
        <div class="meal-card-stats">
          <span class="calories">${meal.calories} <span style="font-size: 0.75rem; font-weight: 500;">kcal</span></span>
          <div class="meal-card-macros">
            <div class="macro-chip"><span class="val text-protein">${meal.protein || 0}g</span><span class="lbl">Prot</span></div>
            <div class="macro-chip"><span class="val text-carbs">${meal.carbs || 0}g</span><span class="lbl">Carb</span></div>
            <div class="macro-chip"><span class="val text-fat">${meal.fat || 0}g</span><span class="lbl">Fat</span></div>
          </div>
        </div>
      </div>
    `;
    
    // Wire up delete event
    card.querySelector('.btn-delete-meal').addEventListener('click', (e) => {
      e.stopPropagation();
      deleteMeal(meal.id);
    });
    
    container.appendChild(card);
  });
  
  lucide.createIcons();
}

function deleteMeal(mealId) {
  const todayData = state.history[state.currentDate];
  if (!todayData) return;
  
  todayData.meals = todayData.meals.filter(m => m.id !== mealId);
  saveState();
  initDashboard(); // Re-render everything
}

// ==========================================
// 4. MEAL LOGGER / UPLOADER CORE LOGIC
// ==========================================
function setupEventListeners() {
  // Water controls
  document.getElementById('btn-water-add').addEventListener('click', () => adjustWater(1));
  document.getElementById('btn-water-sub').addEventListener('click', () => adjustWater(-1));
  
  // Dashboard filter buttons
  const filters = document.querySelectorAll('.meal-filters .filter-pill');
  filters.forEach(pill => {
    pill.addEventListener('click', () => {
      filters.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      renderTodayMealsList(pill.getAttribute('data-filter'));
    });
  });
  
  // File Uploader Zone Setup
  const dropZone = document.getElementById('meal-drop-zone');
  const fileInput = document.getElementById('meal-image-input');
  
  dropZone.addEventListener('click', () => fileInput.click());
  
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });
  
  ['dragleave', 'dragend'].forEach(type => {
    dropZone.addEventListener(type, () => dropZone.classList.remove('drag-over'));
  });
  
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    if (files.length) {
      handleMealImageFile(files[0]);
    }
  });
  
  fileInput.addEventListener('change', () => {
    if (fileInput.files.length) {
      handleMealImageFile(fileInput.files[0]);
    }
  });
  
  // Remove image preview button
  document.getElementById('btn-remove-preview').addEventListener('click', (e) => {
    e.stopPropagation();
    removeMealImagePreview();
  });
  
  // Clear Form button
  document.getElementById('btn-clear-form').addEventListener('click', clearMealForm);
  
  // Form submit event
  document.getElementById('meal-log-form').addEventListener('submit', handleMealLogSubmit);
  
  // Settings profile form
  document.getElementById('settings-profile-form').addEventListener('submit', handleProfileSubmit);
  
  // Settings goals form
  document.getElementById('settings-goals-form').addEventListener('submit', handleGoalsSubmit);
  
  // Macro sliders interaction
  const sliders = ['set-protein-pct', 'set-carbs-pct', 'set-fats-pct'];
  sliders.forEach(id => {
    document.getElementById(id).addEventListener('input', updateSlidersSum);
  });
  
  // Maintenance actions
  document.getElementById('btn-reset-demo').addEventListener('click', resetDemoData);
  document.getElementById('btn-wipe-data').addEventListener('click', wipeAllData);
  
  // Theme Toggle Button
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
  
  // Quick Chat Actions
  const chatPrompts = document.querySelectorAll('.quick-prompt-chip');
  chatPrompts.forEach(chip => {
    chip.addEventListener('click', () => {
      const prompt = chip.getAttribute('data-prompt');
      document.getElementById('chat-user-input').value = prompt;
      sendChatMessage();
    });
  });
  
  // Chat input enter key
  document.getElementById('chat-user-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      sendChatMessage();
    }
  });
  
  document.getElementById('btn-send-message').addEventListener('click', sendChatMessage);
}

function adjustWater(amount) {
  const todayData = state.history[state.currentDate];
  if (!todayData) return;
  
  todayData.water = Math.max(0, (todayData.water || 0) + amount);
  saveState();
  initDashboard();
}

// Compress selected high-res meal image and load into base64
function handleMealImageFile(file) {
  if (!file.type.startsWith('image/')) {
    alert('Please upload a valid image file.');
    return;
  }
  
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = function(event) {
    const img = new Image();
    img.src = event.target.result;
    img.onload = function() {
      // Create a canvas to compress the image size significantly to fit local storage limit
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 320;
      const MAX_HEIGHT = 240;
      let width = img.width;
      let height = img.height;
      
      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      // Get the compressed Data URL
      currentUploadedImageBase64 = canvas.toDataURL('image/jpeg', 0.7);
      
      // Update UI Previews
      const previewImg = document.getElementById('meal-preview-img');
      previewImg.src = currentUploadedImageBase64;
      
      document.getElementById('drop-zone-prompt').classList.add('hidden');
      document.getElementById('preview-container').classList.remove('hidden');
    }
  }
}

function removeMealImagePreview() {
  currentUploadedImageBase64 = null;
  document.getElementById('meal-preview-img').src = '';
  document.getElementById('drop-zone-prompt').classList.remove('hidden');
  document.getElementById('preview-container').classList.add('hidden');
  document.getElementById('meal-image-input').value = '';
}

// Loading Quick Preset Chips
function loadPresets() {
  const container = document.getElementById('presets-container');
  container.innerHTML = '';
  
  DEFAULT_MEAL_DATABASE.slice(0, 6).forEach(preset => {
    const chip = document.createElement('button');
    chip.className = 'preset-chip';
    chip.type = 'button';
    
    // Choose mini icons
    let iconClass = 'utensils';
    if (preset.category === 'Breakfast') iconClass = 'sun';
    else if (preset.category === 'Lunch') iconClass = 'apple';
    else if (preset.category === 'Dinner') iconClass = 'beef';
    else if (preset.category === 'Snacks') iconClass = 'cookie';
    
    chip.innerHTML = `<i data-lucide="${iconClass}"></i><span>${preset.name}</span>`;
    
    chip.addEventListener('click', () => {
      // Pop form values immediately
      document.getElementById('meal-name').value = preset.name;
      document.getElementById('meal-category').value = preset.category;
      document.getElementById('meal-calories').value = preset.calories;
      document.getElementById('meal-protein').value = preset.protein;
      document.getElementById('meal-carbs').value = preset.carbs;
      document.getElementById('meal-fat').value = preset.fat;
    });
    
    container.appendChild(chip);
  });
  
  lucide.createIcons();
}

function clearMealForm() {
  document.getElementById('meal-log-form').reset();
  removeMealImagePreview();
}

function handleMealLogSubmit(e) {
  e.preventDefault();
  
  const name = document.getElementById('meal-name').value.trim();
  const category = document.getElementById('meal-category').value;
  const calories = Number(document.getElementById('meal-calories').value) || 0;
  const protein = Number(document.getElementById('meal-protein').value) || 0;
  const carbs = Number(document.getElementById('meal-carbs').value) || 0;
  const fat = Number(document.getElementById('meal-fat').value) || 0;
  
  const now = new Date();
  const time = now.toTimeString().split(' ')[0].substring(0, 5); // HH:MM
  
  const newMeal = {
    id: 'meal-' + Date.now().toString(36),
    name,
    category,
    calories,
    protein,
    carbs,
    fat,
    time,
    image: currentUploadedImageBase64 // Will be base64 string or null
  };
  
  // Add to today's history list
  if (!state.history[state.currentDate]) {
    state.history[state.currentDate] = { meals: [], water: 0 };
  }
  
  state.history[state.currentDate].meals.push(newMeal);
  saveState();
  
  // Clean up and switch to dashboard
  clearMealForm();
  switchView('dashboard');
}

// ==========================================
// 5. CHART.JS ANALYTICS & TRENDS
// ==========================================
function initAnalyticsCharts() {
  const dates = [];
  const calorieValues = [];
  const goalValues = [];
  
  let totalProteinG = 0;
  let totalCarbsG = 0;
  let totalFatG = 0;
  let daysRecorded = 0;
  
  // Fetch past 7 days logs
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    // Label as 'Mon', 'Tue', etc.
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
    dates.push(dayLabel);
    
    const dayData = state.history[dateStr] || { meals: [], water: 0 };
    let calTotal = 0;
    
    dayData.meals.forEach(m => {
      calTotal += Number(m.calories) || 0;
      totalProteinG += Number(m.protein) || 0;
      totalCarbsG += Number(m.carbs) || 0;
      totalFatG += Number(m.fat) || 0;
    });
    
    calorieValues.push(calTotal);
    goalValues.push(state.goals.calories);
    
    if (dayData.meals.length > 0) daysRecorded++;
  }
  
  // 1. Calculate and update dashboard Metric Badges
  const weeklyCalorieSum = calorieValues.reduce((a, b) => a + b, 0);
  const avgCal = Math.round(weeklyCalorieSum / 7);
  document.getElementById('avg-calories-value').textContent = avgCal.toLocaleString();
  
  // Calorie summary feedback footer
  const calFooter = document.getElementById('avg-calories-value').parentElement.nextElementSibling;
  const deviation = Math.abs(avgCal - state.goals.calories) / state.goals.calories;
  if (deviation <= 0.05) {
    calFooter.className = 'metric-footer text-success';
    calFooter.innerHTML = '<i data-lucide="check"></i> <span>Within 5% of target goal</span>';
  } else if (avgCal > state.goals.calories) {
    calFooter.className = 'metric-footer text-danger';
    calFooter.innerHTML = '<i data-lucide="trending-up"></i> <span>Averaging over calorie budget</span>';
  } else {
    calFooter.className = 'metric-footer text-warning';
    calFooter.innerHTML = '<i data-lucide="trending-down"></i> <span>Consuming light calorie deficit</span>';
  }
  
  // Water average calculation
  let totalWater = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(today.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    totalWater += (state.history[dateStr] || {}).water || 0;
  }
  const avgWater = Math.round((totalWater / 7) * 10) / 10;
  document.getElementById('avg-water-value').textContent = avgWater;
  
  const waterFooter = document.getElementById('avg-water-value').parentElement.nextElementSibling;
  if (avgWater >= state.goals.water) {
    waterFooter.className = 'metric-footer text-success';
    waterFooter.innerHTML = '<i data-lucide="check"></i> <span>Hyrdation target achieved</span>';
  } else {
    const rem = Math.round((state.goals.water - avgWater) * 10) / 10;
    waterFooter.className = 'metric-footer text-warning';
    waterFooter.innerHTML = `<i data-lucide="alert-circle"></i> <span>Increase by ${rem} cups</span>`;
  }
  
  // Protein Consistency calculations
  const targetProteinG = Math.round((state.goals.calories * (state.goals.macros.protein / 100)) / 4);
  let proteinHits = 0;
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const meals = (state.history[dateStr] || {}).meals || [];
    let dProt = 0;
    meals.forEach(m => dProt += m.protein || 0);
    if (dProt >= targetProteinG * 0.85) proteinHits++; // 85% range hit
  }
  const hitRate = Math.round((proteinHits / 7) * 100);
  document.getElementById('protein-target-rate').textContent = `${hitRate}%`;
  
  const proteinFooter = document.getElementById('protein-target-rate').parentElement.nextElementSibling;
  proteinFooter.className = 'metric-footer text-success';
  proteinFooter.innerHTML = `<i data-lucide="arrow-up-right"></i> <span>${proteinHits}/7 days hit limit</span>`;
  
  lucide.createIcons();
  
  // 2. Render Chart.js line graph
  const ctxLine = document.getElementById('calorie-trend-chart').getContext('2d');
  
  // Destroy old graph if loading exists
  if (calorieChart) calorieChart.destroy();
  
  const isDark = document.body.classList.contains('dark-mode');
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
  const labelColor = isDark ? '#9ca3af' : '#4b5563';
  
  // Line gradient fill
  const fillGradient = ctxLine.createLinearGradient(0, 0, 0, 300);
  fillGradient.addColorStop(0, isDark ? 'rgba(16, 185, 129, 0.25)' : 'rgba(16, 185, 129, 0.2)');
  fillGradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
  
  calorieChart = new Chart(ctxLine, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [
        {
          label: 'Eaten Calories',
          data: calorieValues,
          borderColor: '#10B981',
          borderWidth: 3,
          pointBackgroundColor: '#10B981',
          pointHoverRadius: 6,
          fill: true,
          backgroundColor: fillGradient,
          tension: 0.35
        },
        {
          label: 'Goal Target',
          data: goalValues,
          borderColor: '#F97316',
          borderWidth: 1.5,
          borderDash: [5, 5],
          pointRadius: 0,
          fill: false,
          tension: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: labelColor }
        },
        y: {
          grid: { color: gridColor },
          ticks: { color: labelColor }
        }
      }
    }
  });
  
  // 3. Render Chart.js Macro doughnut chart
  const ctxDoughnut = document.getElementById('macro-dist-chart').getContext('2d');
  if (macroChart) macroChart.destroy();
  
  macroChart = new Chart(ctxDoughnut, {
    type: 'doughnut',
    data: {
      labels: ['Protein', 'Carbohydrates', 'Healthy Fats'],
      datasets: [{
        data: [
          totalProteinG * 4,
          totalCarbsG * 4,
          totalFatG * 9
        ],
        backgroundColor: ['#EF4444', '#F59E0B', '#3B82F6'],
        borderWidth: isDark ? 2 : 1,
        borderColor: isDark ? '#111827' : '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: labelColor,
            font: { family: 'Outfit', size: 12 },
            padding: 15
          }
        }
      },
      cutout: '65%'
    }
  });
}

// ==========================================
// 6. WEEKLY SUMMARY ENGINE & AI COACHING CHAT
// ==========================================
function initCoachingPanel() {
  const suggestionsBox = document.getElementById('weekly-suggestions-box');
  suggestionsBox.innerHTML = '';
  
  // Gather statistics for calculations
  const calorieTarget = state.goals.calories;
  let caloriesEatenArray = [];
  let waterArray = [];
  let proteinArray = [];
  
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(today.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayData = state.history[dateStr] || { meals: [], water: 0 };
    
    let dayCalories = 0;
    let dayProtein = 0;
    dayData.meals.forEach(m => {
      dayCalories += m.calories || 0;
      dayProtein += m.protein || 0;
    });
    
    caloriesEatenArray.push(dayCalories);
    waterArray.push(dayData.water || 0);
    proteinArray.push(dayProtein);
  }
  
  const avgCal = Math.round(caloriesEatenArray.reduce((a, b) => a + b, 0) / 7);
  const avgProt = Math.round(proteinArray.reduce((a, b) => a + b, 0) / 7);
  const avgWater = Math.round((waterArray.reduce((a, b) => a + b, 0) / 7) * 10) / 10;
  
  // Calculate recommended protein goal
  const targetProteinG = Math.round((calorieTarget * (state.goals.macros.protein / 100)) / 4);
  
  // 1. CALORIE INSIGHT CARD
  let calTitle, calDesc, calClass;
  if (Math.abs(avgCal - calorieTarget) / calorieTarget <= 0.05) {
    calTitle = "Steady Caloric Balance Achieved";
    calDesc = `Averaging ${avgCal.toLocaleString()} kcal per day is extremely close to your target of ${calorieTarget.toLocaleString()} kcal. Excellent control!`;
    calClass = "positive";
  } else if (avgCal > calorieTarget) {
    calTitle = "Calorie Surplus Detected";
    calDesc = `Your weekly average calorie intake was ${avgCal.toLocaleString()} kcal, exceeding your goal by ${Math.abs(avgCal - calorieTarget).toLocaleString()} kcal. Perfect if bulking, but trim portion sizes if leaning out.`;
    calClass = "improvement";
  } else {
    calTitle = "Consistent Calorie Deficit";
    calDesc = `Averaging ${avgCal.toLocaleString()} kcal daily creates a moderate weight-management deficit of ${Math.round(calorieTarget - avgCal)} kcal. You're steadily burning body fat.`;
    calClass = "positive";
  }
  
  // 2. PROTEIN CARD
  let protTitle, protDesc, protClass;
  if (avgProt >= targetProteinG * 0.9) {
    protTitle = "Outstanding Protein Intake";
    protDesc = `Averaging ${avgProt}g daily helps maintain and rebuild muscle fiber under workout loads. You're fully satisfying your target of ${targetProteinG}g!`;
    protClass = "positive";
  } else if (avgProt < targetProteinG * 0.7) {
    protTitle = "Protein Target Undershoot";
    protDesc = `Your weekly protein average is ${avgProt}g. Since your target is ${targetProteinG}g, try replacing mid-day snacks with the 'Whey Protein' or adding eggs in the morning to increase this.`;
    protClass = "improvement";
  } else {
    protTitle = "Moderate Protein Intake";
    protDesc = `Averaging ${avgProt}g. You're very close to satisfying your daily goal of ${targetProteinG}g. An extra scoop of yogurt or 2 eggs will push you over the line.`;
    protClass = "neutral";
  }
  
  // 3. HYDRATION CARD
  let waterTitle, waterDesc, waterClass;
  if (avgWater >= state.goals.water) {
    waterTitle = "Exceptional Cellular Hydration";
    waterDesc = `Averaging ${avgWater} cups per day is superb! Hitting your hydration goals keeps energy high, speeds recovery, and manages artificial cravings.`;
    waterClass = "positive";
  } else {
    waterTitle = "Hydration Recovery Needed";
    waterDesc = `Averaging ${avgWater} cups instead of your ${state.goals.water} cup target. Keep a visual bottle on your desk and log water using our quick dashboard increment buttons.`;
    waterClass = "improvement";
  }
  
  // Render Summary Cards
  suggestionsBox.innerHTML = `
    <div class="suggestion-group">
      <span class="suggestion-group-title">Weekly Core Performance</span>
      <div class="suggestion-card ${calClass}">
        <h4><i data-lucide="${calClass === 'positive' ? 'check-circle' : 'alert-circle'}"></i> ${calTitle}</h4>
        <p>${calDesc}</p>
      </div>
      <div class="suggestion-card ${protClass}">
        <h4><i data-lucide="${protClass === 'positive' ? 'award' : 'activity'}"></i> ${protTitle}</h4>
        <p>${protDesc}</p>
      </div>
      <div class="suggestion-card ${waterClass}">
        <h4><i data-lucide="droplet"></i> ${waterTitle}</h4>
        <p>${waterDesc}</p>
      </div>
    </div>
    
    <div class="suggestion-group">
      <span class="suggestion-group-title">Coaching Suggestions</span>
      <div class="suggestion-card neutral">
        <h4><i data-lucide="sparkles"></i> Weekly Nutritional Actions</h4>
        <p>1. **Snack Substitution**: Trade mixed walnuts for greek yogurt on low-activity days to reduce fat and elevate amino recovery.</p>
        <p style="margin-top: 5px;">2. **Pre-Workout Fueling**: Log oatmeal 90 minutes before heavy lifting for complex energy optimization.</p>
      </div>
    </div>
  `;
  
  lucide.createIcons();
}

// AI Nutrition Coach Interactive Chat Responses
function sendChatMessage() {
  const inputEl = document.getElementById('chat-user-input');
  const userText = inputEl.value.trim();
  if (!userText) return;
  
  // Append User message bubble
  appendChatBubble('user', userText);
  inputEl.value = '';
  
  // Append loading typing bubble
  const messagesBox = document.getElementById('chat-messages-box');
  const typingEl = document.createElement('div');
  typingEl.className = 'chat-bubble coach';
  typingEl.id = 'typing-indicator';
  typingEl.innerHTML = `
    <div class="bubble-content" style="padding: 0.75rem 1.25rem;">
      <span style="font-style: italic; color: var(--text-muted);">Aura is thinking...</span>
    </div>
  `;
  messagesBox.appendChild(typingEl);
  messagesBox.scrollTop = messagesBox.scrollHeight;
  
  // Simulated AI response processing
  setTimeout(() => {
    // Remove typing bubble
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
    
    // Analyze users weekly state to offer contextual feedback!
    let totalCals = 0;
    let totalProt = 0;
    let dayCount = 0;
    
    Object.keys(state.history).forEach(date => {
      const meals = state.history[date].meals;
      if (meals && meals.length > 0) {
        dayCount++;
        meals.forEach(m => {
          totalCals += m.calories || 0;
          totalProt += m.protein || 0;
        });
      }
    });
    
    const avgCal = dayCount > 0 ? Math.round(totalCals / dayCount) : 0;
    const avgProt = dayCount > 0 ? Math.round(totalProt / dayCount) : 0;
    const targetProt = Math.round((state.goals.calories * (state.goals.macros.protein / 100)) / 4);
    
    let botReply = '';
    const textLower = userText.toLowerCase();
    
    if (textLower.includes('protein')) {
      if (avgProt >= targetProt) {
        botReply = `<p>Brilliant job on protein! Your daily average of <strong>${avgProt}g</strong> completely satisfies your <strong>${targetProt}g</strong> target limit.</p>
                    <p>Maintaining high protein intake helps repair muscle tissue and keeps satiety levels high. Your top protein meals include Salmon and Grilled Chicken Salad. Keep doing exactly what you're doing!</p>`;
      } else {
        botReply = `<p>Your current protein average of <strong>${avgProt}g</strong> is below your ideal target of <strong>${targetProt}g</strong>.</p>
                    <p>Here are a few quick adjustments you can make:</p>
                    <p>• Swap carb-heavy snacks for a cup of Greek Yogurt with berries (adds 15g protein).</p>
                    <p>• Keep the <strong>"Whey Protein Shake"</strong> preset in mind. Clicking it logs 26g of protein for just 140 kcal!</p>
                    <p>• Include three egg whites with your morning Avocado Toast to add 11g of clean protein.</p>`;
      }
    } else if (textLower.includes('recipe') || textLower.includes('breakfast') || textLower.includes('eat')) {
      botReply = `<p>Here's a fantastic, high-protein, calorie-conscious breakfast recipe idea:</p>
                  <p>🍳 <strong>Protein Berry Oatmeal Scramble</strong></p>
                  <p>• <strong>Ingredients</strong>: 40g oats, 3 egg whites, 1/2 scoop whey protein, handful of blueberries, and 1 tsp honey.</p>
                  <p>• <strong>Instructions</strong>: Cook oats in water first. Whisk in the egg whites and whey protein on low heat until creamy. Top with fresh berries and honey!</p>
                  <p>• <strong>Stats</strong>: ~360 kcal | 28g Protein | 42g Carbs | 4g Fats. Logging oatmeal before high intensity sessions is amazing for stable energy releases!</p>`;
    } else if (textLower.includes('wins') || textLower.includes('summary')) {
      botReply = `<p>Here are your major nutrition victories for this past week: 🎉</p>
                  <p>1. <strong>Consistent Logging</strong>: You logged food and monitored targets across multiple consecutive days, which is the #1 habit for metabolic progress.</p>
                  <p>2. <strong>Excellent Calorie Discipline</strong>: Your average of <strong>${avgCal} kcal</strong> shows steady control against your <strong>${state.goals.calories} kcal</strong> ceiling.</p>
                  <p>3. <strong>Hydration Milestones</strong>: You successfully hit your water limits on multiple days, supporting toxin flushes and electrolyte balances.</p>`;
    } else {
      botReply = `<p>Thanks for asking! Looking closely at your logs, your weekly calorie average is <strong>${avgCal} kcal</strong> with an average of <strong>${avgProt}g</strong> of protein.</p>
                  <p>To optimize your training schedule, I recommend:</p>
                  <p>• Consuming a complex carbohydrate like sweet potato or brown rice 2 hours before workouts.</p>
                  <p>• Increasing water intake slightly on training days to facilitate fast hydration transport.</p>
                  <p>Is there a specific fitness goal you are aiming for (e.g., losing body fat, building muscle, or general wellness) so I can tailor my suggestions?</p>`;
    }
    
    appendChatBubble('coach', botReply);
  }, 1000);
}

function appendChatBubble(sender, content) {
  const container = document.getElementById('chat-messages-box');
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${sender}`;
  
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  bubble.innerHTML = `
    <div class="bubble-content">
      ${content}
    </div>
    <span class="chat-time">${timeStr}</span>
  `;
  
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
}

// ==========================================
// 7. SETTINGS AND MAINTENANCE LOGIC
// ==========================================
function syncSettingsUI() {
  document.getElementById('set-username').value = state.userProfile.name;
  document.getElementById('set-activity').value = state.userProfile.activity;
  document.getElementById('set-weight').value = state.userProfile.weight;
  document.getElementById('set-height').value = state.userProfile.height;
  document.getElementById('set-target-weight').value = state.userProfile.targetWeight;
  
  document.getElementById('set-calorie-goal').value = state.goals.calories;
  document.getElementById('set-water-goal').value = state.goals.water;
  
  document.getElementById('set-protein-pct').value = state.goals.macros.protein;
  document.getElementById('set-carbs-pct').value = state.goals.macros.carbs;
  document.getElementById('set-fats-pct').value = state.goals.macros.fat;
  
  updateSlidersSum();
}

function updateSlidersSum() {
  const protein = Number(document.getElementById('set-protein-pct').value);
  const carbs = Number(document.getElementById('set-carbs-pct').value);
  const fats = Number(document.getElementById('set-fats-pct').value);
  
  const total = protein + carbs + fats;
  document.getElementById('macro-total-pct').textContent = total;
  
  document.getElementById('protein-pct-display').textContent = `${protein}%`;
  document.getElementById('carbs-pct-display').textContent = `${carbs}%`;
  document.getElementById('fats-pct-display').textContent = `${fats}%`;
  
  const warning = document.getElementById('macro-slider-warning');
  const btn = document.getElementById('btn-save-goals');
  
  if (total !== 100) {
    warning.classList.remove('hidden');
    btn.disabled = true;
    btn.style.opacity = 0.5;
  } else {
    warning.classList.add('hidden');
    btn.disabled = false;
    btn.style.opacity = 1;
  }
}

function handleProfileSubmit(e) {
  e.preventDefault();
  
  state.userProfile.name = document.getElementById('set-username').value.trim();
  state.userProfile.activity = document.getElementById('set-activity').value;
  state.userProfile.weight = Number(document.getElementById('set-weight').value);
  state.userProfile.height = Number(document.getElementById('set-height').value);
  state.userProfile.targetWeight = Number(document.getElementById('set-target-weight').value);
  
  // Set profile display values in sidebar
  document.getElementById('profile-name').textContent = state.userProfile.name;
  
  let level = 'Active Achiever';
  if (state.userProfile.activity === 'Sedentary') level = 'Casual Calmer';
  else if (state.userProfile.activity === 'Light') level = 'Healthy Walker';
  else if (state.userProfile.activity === 'VeryActive') level = 'Elite Performer';
  
  document.getElementById('profile-level').textContent = level;
  
  saveState();
  alert('Profile saved successfully!');
}

function handleGoalsSubmit(e) {
  e.preventDefault();
  
  const calGoal = Number(document.getElementById('set-calorie-goal').value);
  const waterGoal = Number(document.getElementById('set-water-goal').value);
  const protein = Number(document.getElementById('set-protein-pct').value);
  const carbs = Number(document.getElementById('set-carbs-pct').value);
  const fat = Number(document.getElementById('set-fats-pct').value);
  
  if (protein + carbs + fat !== 100) {
    alert('Macronutrient ratios must equal exactly 100%');
    return;
  }
  
  state.goals.calories = calGoal;
  state.goals.water = waterGoal;
  state.goals.macros = { protein, carbs, fat };
  
  saveState();
  alert('Nutritional goals and ratio thresholds updated!');
  initDashboard(); // Update circles/bars instantly
}

function toggleTheme() {
  const body = document.body;
  const themeText = document.getElementById('theme-text');
  
  if (body.classList.contains('dark-mode')) {
    body.classList.remove('dark-mode');
    body.classList.add('light-mode');
    themeText.textContent = 'Dark Mode';
  } else {
    body.classList.remove('light-mode');
    body.classList.add('dark-mode');
    themeText.textContent = 'Light Mode';
  }
}

// Reset LocalStorage back to preseeded demo data
function resetDemoData() {
  if (confirm('Are you sure you want to reset demo history? This will overwrite current entries with the 7-day demo logs.')) {
    localStorage.removeItem('nutrisnap_profile');
    localStorage.removeItem('nutrisnap_goals');
    localStorage.removeItem('nutrisnap_history');
    
    state.userProfile = {
      name: 'Alex Johnson',
      activity: 'Active',
      weight: 78,
      height: 175,
      targetWeight: 75
    };
    state.goals = {
      calories: 2000,
      water: 8,
      macros: { protein: 30, carbs: 45, fat: 25 }
    };
    state.history = generateMockHistory();
    saveState();
    
    // Reset view
    switchView('dashboard');
    alert('Demo environment re-seeded successfully!');
  }
}

// Clear all LocalStorage data and reload empty history
function wipeAllData() {
  if (confirm('CAUTION: This will delete all history, user profiles, and logs. There is no undo. Proceed?')) {
    localStorage.clear();
    state.userProfile = {
      name: 'User',
      activity: 'Active',
      weight: 70,
      height: 170,
      targetWeight: 70
    };
    state.goals = {
      calories: 2000,
      water: 8,
      macros: { protein: 30, carbs: 40, fat: 30 }
    };
    state.history = {};
    initDate();
    
    state.history[state.currentDate] = { meals: [], water: 0 };
    saveState();
    
    switchView('dashboard');
    alert('All local storage databases cleared completely!');
  }
}
