# 🎓 Master's Schedule - ZCANIC PRO

![License](https://img.shields.io/badge/license-MIT-blue.svg) ![React](https://img.shields.io/badge/react-18.x-61dafb.svg) ![Vite](https://img.shields.io/badge/vite-6.x-646cff.svg) ![Tailwind](https://img.shields.io/badge/tailwind-3.4-38bdf8.svg)

**Master's Schedule - ZCANIC PRO** is a next-generation, high-performance academic planner designed to help students visualize, manage, and optimize their complex course schedules. 

Built with a focus on aesthetics ("Glassmorphism") and usability, it transforms the mundane task of course selection into an interactive, data-driven experience.

## ✨ Key Features

### 📅 Smart Schedule Grid
- **Dynamic Week Slider**: Drag to instantly travel through your semester (Weeks 1-16).
- **Intelligent Layout**: Automatically handles multiple courses in the same slot using density-aware sizing (perfect split for conflicts).
- **Mobile First**: Optimized layout for both desktop monitors and narrow mobile screens.

### 🛠 Powerful Data Editor ("God View")
- **Unified 16-Week Grid**: A revolutionary "Pixel Grid" editor where every time slot is subdivided into 16 weeks. 
- **Interactive Input**: Double-click any "pixel" (week) to instantly add a course to that specific slot.
- **Visual Feedback**: Instantly see which weeks are busy (colored blocks) and which are free (gray).
- **CSV Import/Export**: Backup your schedule or migrate data easily.

### 📊 Review & Visualization
- **Load Analysis**: Real-time bar charts showing weekly intensity (Course Load vs. Week).
- **3D Visualization**: An immersive 3D view of your schedule using `Three.js` (because why not?).
- **Global Heatmap**: A compact 16-week overview of your entire semester's density.

### 🎨 Modern UI/UX
- **Glassmorphism Design**: Sleek, translucent panels with blurred backgrounds.
- **Smooth Transitions**: No more jarring page loads; optimized React transitions for a native app feel.
- **Adaptive Typography**: Font sizes automatically scale based on content density.

## 🚀 Tech Stack

- **Core**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (w/ PostCSS)
- **Visualization**: Recharts (Data), React Three Fiber (3D)
- **State Management**: React Hooks + LocalStorage Persistence

## 📦 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/zcanic/master-s-schedule-.git
   cd master-s-schedule-
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

> Designed & Developed by **zcanic** (2026).
