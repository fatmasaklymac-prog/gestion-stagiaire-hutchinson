import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1D2B5B",
    },
    secondary: {
      main: "#E31E24",
    },
    background: {
      default: "#F4F5F8",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#1F2937",
    },
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: '"Inter", Arial, sans-serif',
  },
});

export default theme;