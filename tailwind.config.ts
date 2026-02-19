import type { Config } from "tailwindcss"
import defaultTheme from "tailwindcss/defaultTheme"
import animate from "tailwindcss-animate"


const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}', 
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}', 
    './src/**/*.{ts,tsx}',
	],
  prefix: "",
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		fontFamily: {
  			sans: [
  				'var(--font-montserrat)',
                    ...defaultTheme.fontFamily.sans
                ],
  			roboto: [
  				'var(--font-roboto)',
                    ...defaultTheme.fontFamily.sans
                ],
			montserrat: [
				'var(--font-montserrat)',
					...defaultTheme.fontFamily.sans
			],
  			kalpurush: [
  				'var(--font-kalpurush)',
  				'var(--font-roboto)',
                    ...defaultTheme.fontFamily.sans
                ]
  		},
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			brand: {
  				black: {
  					DEFAULT: '#231F20',
  					100: '#231F20',
					90: '#141313',
  					80: '#4F4B4C',
  					60: '#7B7879'
  				},
  				white: {
  					DEFAULT: '#FFFFFF',
  					40: '#FFFFFF66',
  					20: '#FFFFFF33'
  				},
  				accent: {
					DEFAULT: '#231F20', // main
					dark: '',
					50: '#F5F3FF',      // Lightest (Backgrounds)
					100: '#EDE9FE',     // Light (Tags)
					200: '#DDD6FE',     // Borders
					300: '#C4B5FD',     // Muted
					400: '#A78BFA',     // Bright
					500: '#8B5CF6',     // DEFAULT (Buttons)
					600: '#7C3AED',     // Hover (Darker)
					700: '#6D28D9',     // Active
					800: '#5B21B6',     // Dark Text
					900: '#4C1D95'      // Deepest
				}
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [animate],
}

export default config;