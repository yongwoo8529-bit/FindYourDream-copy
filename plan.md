# Polaris - Inner Galaxy Counselor

Implementation plan for a premium, celestial-themed counseling application for teenagers.

## 1. Project Structure
- `index.html`: Main application entry point and structure.
- `style.css`: Modern dark-theme styling, glassmorphism, and animations.
- `app.js`: Logic for the survey, score calculation, and Three.js galaxy visualization.
- `particles.js`: Custom particle system logic for the 5-galaxy result view.

## 2. Design System
- **Theme**: Deep Space (Deep blacks, dark blues, subtle star background).
- **Typography**: Orbitron (Headings) and Inter (Body).
- **Color Palettes**:
  - Part 1 (Exploration): Purple (#9b59b6, #8e44ad)
  - Part 2 (Order): Blue (#3498db, #2980b9)
  - Part 3 (Warmth): Orange (#e67e22, #d35400)
  - Part 4 (Resonance): Gold (#f1c40f, #f39c12)
  - Part 5 (Fence): Green (#2ecc71, #27ae60)
- **Glassmorphism**: Translucent cards for questions.

## 3. Core Features
- **Intro Screen**: Captivating title with "Find your Polaris" message.
- **Survey System**:
  - 5 segments (4 questions each).
  - 1-5 rating buttons (modern, glowing).
  - Smooth transitions between questions.
- **Result Logic**:
  - Score summation (Max 20 per part).
  - Highest part determines the central Polaris color.
- **Visualization (Three.js)**:
  - Initial state: Dark screen with "Your inner Polaris is being created..." message.
  - Formation: A bright central star (Polaris) appears.
  - Interaction: Clicking Polaris triggers an "explosion" into 5 distinct particle galaxies.
  - Galaxy Sizing: Galaxy size / particle density proportional to user's part scores.

## 4. Technology Stack
- **HTML5/CSS3**: Core layout and styling.
- **JavaScript (ES6+)**: Logic.
- **Three.js**: High-quality 3D particle rendering for the "galaxy" effect.
- **Google Fonts**: Modern typography for a premium feel.

## 5. Development Steps
1. Initialize `index.html` with basic structure.
2. Build the `style.css` design system.
3. Implement `app.js` survey logic (question rendering and score tracking).
4. Create the Three.js-driven result visualization.
5. Add final polish (micro-animations, sounds, and mobile responsiveness).
