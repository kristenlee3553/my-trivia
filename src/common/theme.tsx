import { createTheme, ThemeProvider, type ThemeOptions } from "@mui/material";

const themeOptions: ThemeOptions = {
  palette: {
    primary: {
      main: "#14213d",
      light: "#003D71",
      contrastText: "white",
    },
    secondary: {
      main: "#FCA311",
      light: "#FDBD55",
      dark: "#D28202",
      contrastText: "black",
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableFocusRipple: true,
      },
      variants: [
        {
          props: { variant: "primary" },
          style: {
            backgroundColor: "#14213d",
            border: "2px solid #FCA311",
            color: "#FCA311",
            "&:hover": {
              backgroundColor: "#1B2E55",
            },
            "&:focus-visible": {
              outline: "2px solid white",
              outlineOffset: "5px",
            },
          },
        },
        {
          props: { variant: "secondary" },
          style: {
            backgroundColor: "#14213d",
            border: "2px solid #2ec4b6",
            color: "#2ec4b6",
            "&:hover": {
              backgroundColor: "#1B2E55",
            },
            "&:focus-visible": {
              outline: "2px solid white",
              outlineOffset: "5px",
            },
          },
        },
      ],
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          border: "2px solid #FCA311",
          "& input": {
            color: "#e5e5e5",
          },
          "&:hover": {
            backgroundColor: "#1B2E55",
          },
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        root: {
          color: "#BAC9E9",
          gap: "12px",
        },
      },
    },
  },
};

export default function ThemeWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const baseTheme = createTheme(themeOptions);

  return <ThemeProvider theme={baseTheme}>{children}</ThemeProvider>;
}
