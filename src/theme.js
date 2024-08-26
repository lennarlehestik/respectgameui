import { extendTheme } from '@mui/joy/styles';

const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          50: '#EFE7FF',
          100: '#D3BFFF',
          200: '#B699FF',
          300: '#9974FF',
          400: '#7C4FFF',
          500: '#530CAF', // Your chosen primary color
          600: '#4401A8',
          700: '#36008C',
          800: '#280070',
          900: '#1A0054',
        },
        secondary: {
          50: '#FFECE5',
          100: '#FFD0BF',
          200: '#FFB399',
          300: '#FF9673',
          400: '#FF7A4D',
          500: '#FF6B35', // Your chosen secondary color
          600: '#FF5A1F',
          700: '#FF4909',
          800: '#F23900',
          900: '#D63200',
        },
      },
    },
  },
});

export default theme;