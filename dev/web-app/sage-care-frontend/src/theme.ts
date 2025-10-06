import { extendTheme, ThemeConfig } from "@chakra-ui/react";

// Example Figma-based tokens (replace with actual Figma values as needed)
const colors = {
  brand: {
    50: "#e9edfb",
    100: "#c8d2f6",
    200: "#a4b5f0",
    300: "#7f98ea",
    400: "#637ee6",
    500: "#5164E8", // Primary blue from Colors.tsx
    600: "#3e4db6",
    700: "#2c3684",
    800: "#1a2053",
    900: "#080a24",
  },
  gray: {
    50: "#f7f7f7",
    100: "#e1e1e1",
    200: "#cfcfcf",
    300: "#b1b1b1",
    400: "#969696", // navGray
    500: "#6C6C6C", // textGray
    600: "#4d4d4d",
    700: "#333333",
    800: "#1a1a1a",
    900: "#0a0a0a",
  },
};

const fonts = {
  heading: 'Geist, Inter, sans-serif',
  body: 'Inter, Geist, sans-serif',
};

const radii = {
  none: "0",
  sm: "4px",
  md: "8px",
  lg: "12px", // Used in most components
  xl: "16px",
  full: "9999px",
};

const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  colors,
  fonts,
  radii,
  components: {
    Button: {
      baseStyle: {
        borderRadius: "lg",
        fontWeight: 600,
      },
      sizes: {
        lg: {
          h: "48px",
          fontSize: "18px",
          px: "32px",
        },
      },
      variants: {
        solid: {
          bg: "brand.500",
          color: "white",
          _hover: { bg: "brand.600" },
        },
      },
    },
    Input: {
      baseStyle: {
        field: {
          borderRadius: "lg",
          bg: "gray.50",
        },
      },
    },
    Avatar: {
      baseStyle: {
        borderRadius: "full",
      },
    },
  },
});

export default theme; 