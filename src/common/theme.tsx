import { createTheme, ThemeProvider, type ThemeOptions } from "@mui/material";

type OptionColorDetails = {
  background: string;
  toggledBg: string;
  hoverBg: string;
  color: string;
  toggledColor: string;
};

export const OPTION_COLORS = [
  "red",
  "blue",
  "orange",
  "green",
  "pink",
  "purple",
] as const;

export type OPTION_COLORS_KEYS = (typeof OPTION_COLORS)[number];

export const OPTION_COLOR_MAP: Record<OPTION_COLORS_KEYS, OptionColorDetails> =
  {
    orange: {
      background: "#2a2215", // Dark mud/brown
      hoverBg: "#FFD27D44",
      toggledBg: "#FFD27D", // Bright Sun
      color: "#FFD27D", // Text matches the glow when unselected
      toggledColor: "#131f47",
    },
    blue: {
      background: "#0d2035", // Deep Navy
      hoverBg: "#00D2FF44",
      toggledBg: "#00D2FF", // Electric Cyan
      color: "#00D2FF",
      toggledColor: "#FFFFFF",
    },
    red: {
      background: "#2d1618", // Dark Wine
      hoverBg: "#FF4D4D44",
      toggledBg: "#FF4D4D", // Bright Neon Red
      color: "#FF4D4D",
      toggledColor: "#FFFFFF",
    },
    green: {
      background: "#122a24", // Dark Forest
      hoverBg: "#00FFB244",
      toggledBg: "#00FFB2", // Acid Green
      color: "#00FFB2",
      toggledColor: "#131f47",
    },
    purple: {
      background: "#1f1430", // Dark Grape
      hoverBg: "#B388FF44",
      toggledBg: "#B388FF", // Bright Lavender
      color: "#B388FF",
      toggledColor: "#FFFFFF",
    },
    pink: {
      background: "#2d141e", // Dark Plum
      hoverBg: "#FF2E7E44",
      toggledBg: "#FF2E7E", // Hot Pink
      color: "#FF2E7E",
      toggledColor: "#FFFFFF",
    },
  };

const themeOptions: ThemeOptions = {
  palette: {
    primary: {
      main: "#b490d6",
      light: "#d5bdfc",
      dark: "#8269a7",
      contrastText: "#131f47",
    },
    secondary: {
      main: "#b6e1fa",
      light: "#e0f2fe",
      dark: "#131f47",
      contrastText: "#fdeac9",
    },
    error: {
      main: "#faa082",
      light: "#ffc4b0",
    },
    text: {
      primary: "#fdeac9",
      secondary: "#b6e1fa",
      disabled: "#6b7aab",
    },
    background: {
      default: "#131f47",
      paper: "#1c2b5e",
    },
    action: {
      hover: "rgba(182, 225, 250, 0.12)",
      selected: "rgba(182, 225, 250, 0.2)",
      focus: "#b6e1fa",
      disabled: "rgba(253, 234, 201, 0.3)",
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
            border: `2px solid ${theme.palette.primary.light}`,
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
