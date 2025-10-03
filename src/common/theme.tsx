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
            border: "2px solid #FCA311",
            color: "#FCA311",
          },
        },
        {
          props: { variant: "secondary" },
          style: {
            border: "2px solid #2ec4b6",
            color: "#2ec4b6",
            "&.Mui-disabled": {
              backgroundColor: "#1a1f3a", // darker or muted color
              border: "2px solid #888", // muted border
              color: "#888", // muted text
              cursor: "not-allowed",
            },
          },
        },
        {
          props: { variant: "cancel" },
          style: {
            border: "2px solid #C1292E",
            color: "#C1292E",
          },
        },
      ],
      styleOverrides: {
        root: {
          backgroundColor: "#14213d",
          "&:hover": {
            backgroundColor: "#1B2E55",
          },
          "&:focus-visible": {
            outline: "2px solid white",
            outlineOffset: "5px",
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          border: "2px solid #FCA311",
          "& input": {
            color: "#e5e5e5",
          },
          "&:hover": {
            backgroundColor: "#1B2E55",
          },
          // Error state
          "&.Mui-error": {
            borderColor: "#C1292E", // red border
          },
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          marginTop: "4px",
          color: "#C1292E !important",
          fontSize: "0.9rem",
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        root: {
          color: "#BAC9E9",
          gap: "12px",
          margin: 0,
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
