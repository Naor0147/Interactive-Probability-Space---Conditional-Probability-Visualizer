# 🌌 Interactive Probability Space Visualizer

<p align="center">
  <strong>A premium, interactive web application for exploring probability spaces, sets, and conditional probability in real-time.</strong><br>
  Built with a sleek, Apple-inspired aesthetic featuring glassmorphism and fluid physics.
</p>

---

## ✨ Features

- **Dual-Mode Exploration:**
  - **Continuous Mode:** Drag sliders to adjust marginal and intersection probabilities ($P(A)$, $P(A \cap B)$, etc.) and watch the universe react dynamically.
  - **Discrete Mode:** Input explicit text elements to be computed into sets and placed exactly in their respective intersections.
- **Real-Time Physics-Based Animations:** Smooth, liquid-like transitions for Venn diagram updates, powered by Framer Motion and D3.js.
- **Live Calculation Engine:** Instant computation of Bayes' theorem, conditionals ($P(A|B)$), unions, and complements.
- **Premium Glassmorphism Design:** A minimalist dark-mode aesthetic featuring deep blurs, ambient glowing orbs, and refined typography.
- **Educational Tooltips:** Human-readable explanations for complex mathematical notation and live insights (e.g., checking for independence or mutual exclusivity).

## 🛠 Tech Stack

- **Framework:** [React 18](https://react.dev/) built with [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) for utility-first styling with custom CSS variables for the dark neon theme.
- **Animations:** [Framer Motion](https://www.framer.com/motion/) for spring-based, fluid micro-interactions.
- **Data Visualization:** [D3.js](https://d3js.org/) for calculating proportional Venn diagram layouts and positioning.
- **Icons:** [Lucide React](https://lucide.dev/) for crisp, consistent UI iconography.

## 🚀 Getting Started

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   ```

2. **Navigate to the directory:**
   ```bash
   cd math
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   Navigate to the URL provided in your terminal (usually `http://localhost:5173` or `http://localhost:5174`).

## 📐 Mathematical Model

The application strictly models a probability space $(\Omega,\mathcal{F},P)$ containing up to three events $A,B,C \subseteq \Omega$ such that $0<P(A),P(B),P(C)<1$. 
It validates inputs to prevent illogical states (e.g., $P(A \cap B) > P(A)$) and intelligently limits sliders and inputs to maintain a valid mathematical universe.

## 📄 License

This project is licensed under the MIT License.
