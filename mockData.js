// NutriSnap Mock Data and Core Presets

const DEFAULT_MEAL_DATABASE = [
  { name: 'Avocado Toast with Poached Egg', calories: 380, protein: 16, carbs: 32, fat: 22, category: 'Breakfast' },
  { name: 'Smoked Salmon & Cream Cheese Bagel', calories: 450, protein: 24, carbs: 48, fat: 16, category: 'Breakfast' },
  { name: 'Oatmeal with Banana, Honey & Chia', calories: 320, protein: 8, carbs: 58, fat: 6, category: 'Breakfast' },
  { name: 'Grilled Chicken & Quinoa Salad', calories: 520, protein: 42, carbs: 38, fat: 14, category: 'Lunch' },
  { name: 'Mediterranean Chickpea & Feta Wrap', calories: 460, protein: 15, carbs: 52, fat: 18, category: 'Lunch' },
  { name: 'Tuna Salad on Whole Wheat Sourdough', calories: 410, protein: 28, carbs: 35, fat: 12, category: 'Lunch' },
  { name: 'Pan-Seared Salmon with Sweet Potato', calories: 650, protein: 44, carbs: 42, fat: 26, category: 'Dinner' },
  { name: 'Lean Beef & Broccoli Stir-Fry', calories: 580, protein: 38, carbs: 45, fat: 18, category: 'Dinner' },
  { name: 'Tofu & Vegetable Coconut Curry', calories: 510, protein: 18, carbs: 50, fat: 22, category: 'Dinner' },
  { name: 'Greek Yogurt with Mixed Berries', calories: 180, protein: 15, carbs: 18, fat: 3, category: 'Snacks' },
  { name: 'Mixed Almonds and Walnuts (Handful)', calories: 200, protein: 6, carbs: 8, fat: 17, category: 'Snacks' },
  { name: 'Whey Protein Shake (Water)', calories: 140, protein: 26, carbs: 3, fat: 2, category: 'Snacks' }
];

// Generates 7 days of realistic logging history leading up to today
function generateMockHistory() {
  const history = {};
  const today = new Date();
  
  // Custom mock logs for the past 7 days
  const sampleDays = [
    {
      // 7 days ago - Under calorie goal, lower protein
      meals: [
        { name: 'Oatmeal with Banana', calories: 320, protein: 8, carbs: 58, fat: 6, category: 'Breakfast', image: 'preset-oatmeal' },
        { name: 'Mediterranean Chickpea Wrap', calories: 460, protein: 15, carbs: 52, fat: 18, category: 'Lunch', image: 'preset-wrap' },
        { name: 'Tofu & Vegetable Curry', calories: 510, protein: 18, carbs: 50, fat: 22, category: 'Dinner', image: 'preset-curry' },
        { name: 'Mixed Almonds', calories: 200, protein: 6, carbs: 8, fat: 17, category: 'Snacks', image: 'preset-nuts' }
      ],
      water: 4
    },
    {
      // 6 days ago - High calorie, active day, good macro balance
      meals: [
        { name: 'Smoked Salmon Bagel', calories: 450, protein: 24, carbs: 48, fat: 16, category: 'Breakfast', image: 'preset-bagel' },
        { name: 'Grilled Chicken & Quinoa Salad', calories: 520, protein: 42, carbs: 38, fat: 14, category: 'Lunch', image: 'preset-salad' },
        { name: 'Lean Beef & Broccoli Stir-Fry', calories: 580, protein: 38, carbs: 45, fat: 18, category: 'Dinner', image: 'preset-beef' },
        { name: 'Greek Yogurt with Berries', calories: 180, protein: 15, carbs: 18, fat: 3, category: 'Snacks', image: 'preset-yogurt' },
        { name: 'Whey Protein Shake', calories: 140, protein: 26, carbs: 3, fat: 2, category: 'Snacks', image: 'preset-shake' }
      ],
      water: 8
    },
    {
      // 5 days ago - Balanced day, perfect target matching
      meals: [
        { name: 'Avocado Toast with Poached Egg', calories: 380, protein: 16, carbs: 32, fat: 22, category: 'Breakfast', image: 'preset-avotoast' },
        { name: 'Tuna Salad on Sourdough', calories: 410, protein: 28, carbs: 35, fat: 12, category: 'Lunch', image: 'preset-tuna' },
        { name: 'Pan-Seared Salmon with Sweet Potato', calories: 650, protein: 44, carbs: 42, fat: 26, category: 'Dinner', image: 'preset-salmon' },
        { name: 'Mixed Almonds', calories: 200, protein: 6, carbs: 8, fat: 17, category: 'Snacks', image: 'preset-nuts' }
      ],
      water: 6
    },
    {
      // 4 days ago - Cheat day / High carb, low water
      meals: [
        { name: 'Pancakes with Syrup & Butter', calories: 650, protein: 10, carbs: 98, fat: 20, category: 'Breakfast' },
        { name: 'Double Cheeseburger & Fries', calories: 950, protein: 45, carbs: 85, fat: 48, category: 'Lunch' },
        { name: 'Cheese Pizza (2 Slices)', calories: 580, protein: 24, carbs: 64, fat: 22, category: 'Dinner' },
        { name: 'Chocolate Chip Cookies (2)', calories: 280, protein: 4, carbs: 38, fat: 12, category: 'Snacks' }
      ],
      water: 3
    },
    {
      // 3 days ago - Recovery day: Clean, very high protein
      meals: [
        { name: 'Egg White Scramble & Spinach', calories: 220, protein: 28, carbs: 8, fat: 8, category: 'Breakfast' },
        { name: 'Grilled Chicken Breast & Asparagus', calories: 420, protein: 46, carbs: 12, fat: 10, category: 'Lunch', image: 'preset-salad' },
        { name: 'Pan-Seared Salmon with Steamed Broccoli', calories: 550, protein: 42, carbs: 10, fat: 24, category: 'Dinner', image: 'preset-salmon' },
        { name: 'Whey Protein Shake', calories: 140, protein: 26, carbs: 3, fat: 2, category: 'Snacks', image: 'preset-shake' },
        { name: 'Greek Yogurt with Berries', calories: 180, protein: 15, carbs: 18, fat: 3, category: 'Snacks', image: 'preset-yogurt' }
      ],
      water: 9
    },
    {
      // 2 days ago - Busy day, skipped lunch, high calorie dinner
      meals: [
        { name: 'Oatmeal with Banana', calories: 320, protein: 8, carbs: 58, fat: 6, category: 'Breakfast', image: 'preset-oatmeal' },
        { name: 'Ribeye Steak with Baked Potato', calories: 980, protein: 62, carbs: 48, fat: 58, category: 'Dinner' },
        { name: 'Mixed Almonds', calories: 200, protein: 6, carbs: 8, fat: 17, category: 'Snacks', image: 'preset-nuts' }
      ],
      water: 5
    },
    {
      // Yesterday - Balanced day
      meals: [
        { name: 'Avocado Toast with Poached Egg', calories: 380, protein: 16, carbs: 32, fat: 22, category: 'Breakfast', image: 'preset-avotoast' },
        { name: 'Tuna Salad on Sourdough', calories: 410, protein: 28, carbs: 35, fat: 12, category: 'Lunch', image: 'preset-tuna' },
        { name: 'Tofu & Vegetable Curry', calories: 510, protein: 18, carbs: 50, fat: 22, category: 'Dinner', image: 'preset-curry' },
        { name: 'Greek Yogurt with Berries', calories: 180, protein: 15, carbs: 18, fat: 3, category: 'Snacks', image: 'preset-yogurt' }
      ],
      water: 7
    }
  ];

  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(today.getDate() - (7 - i));
    const dateString = d.toISOString().split('T')[0];
    
    // Copy the sample data
    const sample = sampleDays[i];
    history[dateString] = {
      meals: sample.meals.map(m => ({
        ...m,
        id: 'mock-' + Math.random().toString(36).substr(2, 9),
        time: '12:00' // Mock logged time
      })),
      water: sample.water
    };
  }

  return history;
}

// Map key keywords to beautiful stock-like high-contrast CSS gradient styles
// to render when a meal doesn't have an uploaded file image.
const PRESET_GRADIENTS = {
  'Breakfast': 'linear-gradient(135deg, #FF9B9B 0%, #FFD6A5 100%)',
  'Lunch': 'linear-gradient(135deg, #A8E6CF 0%, #DED2F9 100%)',
  'Dinner': 'linear-gradient(135deg, #A8DADC 0%, #457B9D 100%)',
  'Snacks': 'linear-gradient(135deg, #FFD166 0%, #FFFCF2 100%)',
  'default': 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)'
};
