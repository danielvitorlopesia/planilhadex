import React from "react";
import { MenuItem, TextField } from "@mui/material";

type EditableCellOption = {
  value: string;
  label: string;
};

type Props = {
  value: string | number;
  onChange: (value: string) => void;
  type?: "text" | "number" | "select";
  options?: EditableCellOption[];
  label?: string;
  disabled?: boolean;
  min?: number;
  step?: number;
};

export default function EditableCell({
  value,
  onChange,
  type = "text",
  options = [],
  label,
  disabled = false,
  min,
  step,
}: Props) {
  if (type === "select") {
    return (
      <TextField
        select
        size="small"
        fullWidth
        label={label}
        value={String(value ?? "")}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
    );
  }

  return (
    <TextField
      size="small"
      fullWidth
      label={label}
      type={type === "number" ? "number" : "text"}
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      inputProps={
        type === "number"
          ? {
              min,
              step: step ?? 0.01,
              inputMode: "decimal",
            }
          : undefined
      }
    />
  );
}
