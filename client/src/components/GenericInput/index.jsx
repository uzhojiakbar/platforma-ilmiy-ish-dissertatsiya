import { FormControl, TextField } from "@mui/material";
import React from "react";

const GenericInput = (props) => {
  return (
    <FormControl fullWidth>
      <TextField
        id="outlined-basic"
        label={props?.pc}
        variant="outlined"
        error={props.error}
        inputRef={props.inputRef}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "120px",
            width: "100%",
            height: "48px",
            fontSize: "14px",
            "& fieldset": {
              borderColor: props.error ? "#d32f2f" : "#e5e5e5",
              borderWidth: props.error ? "1.5px" : "1px",
              transition: "border-color 0.2s, border-width 0.2s",
            },
            "&:hover fieldset": {
              borderColor: props.error ? "#d32f2f" : "#1976d2",
            },
            "&.Mui-focused fieldset": {
              borderColor: props.error ? "#d32f2f" : "#1976d2",
              borderWidth: "2px",
            },
          },
          "& .MuiInputBase-input": {
            fontSize: "14px",
          },
          "& .MuiInputLabel-root": {
            fontSize: "13px",
          },
        }}
        {...props}
      />
    </FormControl>
  );
};

export default GenericInput;
