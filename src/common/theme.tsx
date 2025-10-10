import { createTheme, ThemeProvider, type ThemeOptions } from "@mui/material";

const themeOptions: ThemeOptions = {
  palette: {
    primary: {
      main: "#FCA311",
      light: "#FDBD55",
      dark: "#D28202",
      contrastText: "black",
    },
    secondary: {
      main: "#2ec4b6",
      contrastText: "black",
    },
    error: {
      main: "#C1292E",
    },
    text: {
      primary: "#efefef",
      secondary: "#BAC9E9",
      disabled: "#888",
    },
    background: {
      default: "#14213d",
    },
    action: {
      hover: "#1B2E55",
      focus: "white",
      disabled: "#1a1f3a",
    },
  },
  spacing: (factor: number) => `${10 * factor}px`,
  components: {
    MuiButton: {
      defaultProps: {
        disableFocusRipple: true,
      },
      variants: [
        {
          props: { variant: "primary" },
          style: ({ theme }) => ({
            border: `2px solid ${theme.palette.primary.main}`,
            color: theme.palette.primary.main,
          }),
        },
        {
          props: { variant: "secondary" },
          style: ({ theme }) => ({
            border: `2px solid ${theme.palette.secondary.main}`,
            color: theme.palette.secondary.main,
          }),
        },
        {
          props: { variant: "cancel" },
          style: ({ theme }) => ({
            border: `2px solid ${theme.palette.error.main}`,
            color: theme.palette.error.main,
          }),
        },
      ],
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.default,
          "&:hover": {
            backgroundColor: theme.palette.action.hover,
          },
          "&:focus-visible": {
            outline: `2px solid ${theme.palette.action.focus}`,
            outlineOffset: "5px",
          },
          "&.Mui-disabled": {
            backgroundColor: theme.palette.action.disabled,
            border: `2px solid ${theme.palette.text.disabled}`,
            color: theme.palette.text.disabled,
            cursor: "not-allowed",
          },
        }),
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          border: `2px solid ${theme.palette.primary.main}`,
          "& input": {
            color: theme.palette.text.primary,
          },
          "&:hover": {
            backgroundColor: theme.palette.action.hover,
          },
          // Error state
          "&.Mui-error": {
            borderColor: theme.palette.error.main,
          },
        }),
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: ({ theme }) => ({
          marginTop: "4px",
          color: `${theme.palette.error.main} !important`,
          fontSize: "0.9rem",
        }),
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.palette.text.secondary,
          gap: "12px",
          margin: 0,
        }),
      },
    },
    MuiToggleButton: {
      defaultProps: {
        disableFocusRipple: true,
        disableTouchRipple: true,
      },
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: "8px",
          color: theme.palette.text.primary,
          "&:hover": {
            backgroundColor: theme.palette.primary.light,
            border: "none",
            color: theme.palette.primary.contrastText,
          },
          border: `2px solid ${theme.palette.text.secondary}`,
          transition: "all 0.2s ease-in-out",
          "&.Mui-selected": {
            color: theme.palette.primary.contrastText,
            textShadow: "0 0 1px rgba(0,0,0,0.5)",
            border: "none",
            background: `linear-gradient(145deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
          },

          "&:focus-visible": {
            outline: `4px solid ${theme.palette.primary.main}`,
            outlineOffset: "5px",
          },
        }),
      },
    },
    MuiCheckbox: {
      defaultProps: {
        disableFocusRipple: true,
        disableTouchRipple: true,
      },
      styleOverrides: {
        root: ({ theme }) => ({
          "&.Mui-focusVisible": {
            outline: `2px solid ${theme.palette.action.focus}`,
          },
          padding: 0,
        }),
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderColor: theme.palette.text.primary,
          borderWidth: "1px",
          borderStyle: "solid",
        }),
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
