# Walkthrough — NutriSnap Calorie & Meal Tracker

**NutriSnap** is a glassmorphic Single Page Application (SPA) that provides calorie tracking, macro distribution, water hydration logs, meal visual uploads, dynamic charting, and virtual AI health coaching.

---

## 🛠️ Created File Structure

1. **[index.html]**
   - Houses the premium glassmorphic sidebar layout, dates displaying widgets, calorie progress gauges, and flexible grid cards.
   - Contains navigation panels for the Dashboard, Log Meal Forms, Analytics, AI Coach chat room, and detailed Target Sliders.
2. **[style.css]**
   - Built with a modern dark-mode setup (with high-contrast neon greens, tomatoes, wheats, and sky blues).
   - Features responsive flex-grids, interactive hover transitions, glass blur shadows (`backdrop-filter`), and a custom CSS keyframe animated wave hydration glass.
   - Fully supports a beautiful **Light-Mode (Organic Mint)** color theme toggled at a button click.
3. **[app.js]**
   - Oversees local state, rendering, dynamic calorie calculations, and filter options.
   - Integrates a smart **HTML5 Canvas compression utility** to automatically scale down uploaded meal pictures to thumbnails (~300px JPEG) so they can fit inside LocalStorage without hitting quota caps.
   - Embeds the interactive **AI Nutrition Coach Chatbot** which parses keywords and provides personalized advice referencing your actual historical averages.
4. **[mockData.js]**
   - Holds standard presets (Oatmeal, Salmon, Chicken wrap) for rapid form entry.
   - Automatically pre-seeds a highly realistic 7-day log history including varied caloric balances so you don't start with a blank screen.

---

## 🌟 Key Application Features

### 1. Unified Glassmorphic Dashboard
- **Calorie Overlay Gauge**: A custom circular SVG ring that turns from Emerald Green to Sunset Red if you exceed your daily threshold.
- **Micro-Progress Indicators**: Live progress bars tracking target protein, carb, and healthy fat counts.
- **Waves Hydration Widget**: Interactive cup addition/subtraction controls linked to an elegant wave container that fills dynamically as cups are logged.
- **Filtering System**: Seamless instant filtering of today's meals by category (Breakfast, Lunch, Dinner, Snacks).

### 2. Fast Food Logger & Image Scale down
- Supports dragging and dropping meal photos with visual confirmation and remove buttons.
- Selects quick-add chips (e.g., Avocado Toast) to automatically populate calories and macros.

### 3. Dynamic Charts (Chart.js)
- Draws smooth, bezier calorie trends vs. daily goal lines with ambient gradient under-fills.
- Renders standard macronutrient distribution donut charts tracking total balance.

### 4. Interactive Coaching Cabin
- **Weekly Health Reviewer**: Generates automated summaries of calorie deficits, protein intake margins, and hydration scores from the past 7 days of logs.
- **Coach Aura Chatbot**: Enter prompts or click suggestion chips (e.g., "Give me a high-protein recipe idea") to get metabolic support.

---

## 🚀 How to Run the App

Because NutriSnap is a pure HTML5, CSS3, and JavaScript Single Page App with **no external server dependencies or compilations needed**, launching it is incredibly simple:

1. **Direct Browser Launch**:
   Simply navigate to the project directory and open `index.html` in any modern web browser (Chrome, Edge, Firefox, Safari).
   - File Path: [index.html]
