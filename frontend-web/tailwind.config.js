/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3366CC',   // Azul Principal de ParkingPaTi
        secondary: '#54595D', // Gris Neutro
        tertiary: '#041333',  // Azul Oscuro
        success: '#22C55E',   // Verde Disponible
        danger: '#EF4444',    // Rojo Lleno
        warning: '#F59E0B',   // Amarillo Casi lleno
      },
      fontFamily: {
        headline: ['Comfortaa', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        label: ['Public Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}