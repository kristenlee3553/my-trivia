import {
  Checkbox,
  FormControlLabel,
  type CheckboxProps,
  type FormControlLabelProps,
} from "@mui/material";

type BaseCheckboxProps = {
  label: string | React.ReactNode;
  labelPlacement?: FormControlLabelProps["labelPlacement"];
  onChange: (checked: boolean) => void;
  checked: boolean;
  slotProps?: {
    formControlLabel?: Omit<FormControlLabelProps, "labelPlacement" | "label">;
    checkbox?: Omit<CheckboxProps, "onChange" | "checked">;
  };
};

export default function BaseCheckbox({
  label,
  labelPlacement,
  slotProps,
  checked,
  onChange,
}: BaseCheckboxProps) {
  return (
    <FormControlLabel
      {...slotProps?.formControlLabel}
      labelPlacement={labelPlacement ?? "start"}
      control={
        <Checkbox
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          color="secondary"
          size="large"
          {...slotProps?.checkbox}
        />
      }
      label={label}
      sx={{
        gap: 0,
        ...slotProps?.formControlLabel?.sx,
      }}
    />
  );
}
