/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'Menlo', 'monospace'],
            },
            colors: {
                accent: {
                    blue:   '#5ac8fa',
                    purple: '#bf5af2',
                    orange: '#ff9f0a',
                    green:  '#30d158',
                    red:    '#ff453a',
                    teal:   '#64d2ff',
                    pink:   '#ff375f',
                },
                surface: {
                    0: '#000000',
                    1: '#0a0a0a',
                    2: '#111111',
                    3: '#1a1a1a',
                    4: '#222222',
                    5: '#2a2a2a',
                }
            },
            borderRadius: {
                'apple': '22px',
            },
            boxShadow: {
                'glass': '0 2px 40px rgba(0,0,0,0.25)',
                'glass-sm': '0 1px 20px rgba(0,0,0,0.15)',
                'glow-blue': '0 0 20px rgba(90,200,250,0.2)',
                'glow-purple': '0 0 20px rgba(191,90,242,0.2)',
                'glow-orange': '0 0 20px rgba(255,159,10,0.2)',
            },
        },
    },
    plugins: [],
}
