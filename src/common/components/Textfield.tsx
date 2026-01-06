import {
  FormControlLabel,
  TextField,
  Typography,
  type FormControlLabelProps,
  type TextFieldProps,
  type TypographyProps,
} from "@mui/material";

type BaseTextFieldProps = {
  labelText: string;
  labelAlignment?: FormControlLabelProps["labelPlacement"];
  onChange: (value: string) => void;
  slotProps?: {
    formControlLabel?: Partial<
      Omit<FormControlLabelProps, "label" | "control" | "labelPlacement">
    >;
    textField?: Partial<Omit<TextFieldProps, "onChange">>;
    typography?: Partial<Omit<TypographyProps, "children">>;
  };
};

export default function BaseTextField({
  labelAlignment,
  labelText,
  slotProps,
  onChange,
}: BaseTextFieldProps) {
  return (
    <FormControlLabel
      {...slotProps?.formControlLabel}
      control={
        <TextField
          placeholder={labelText}
          {...slotProps?.textField}
          onChange={(e) => onChange(e.target.value)}
          sx={{
            width: "100%",
            ...slotProps?.textField?.sx,
          }}
        />
      }
      label={
        <Typography fontSize={20} {...slotProps?.typography}>
          {labelText}
        </Typography>
      }
      labelPlacement={labelAlignment ?? "top"}
      sx={{
        width: "100%",
        ...slotProps?.formControlLabel?.sx,
      }}
    />
  );
}
