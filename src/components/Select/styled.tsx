import FormControl from "@mui/material/FormControl";
import { inputClasses } from "@mui/material/Input";
import { selectClasses } from "@mui/material/Select";
import { styled, css } from "@mui/material/styles";

export const SelectFormControl = styled(FormControl, {
  name: "SelectFormControl",
})(
  () => css`
    min-width: 124px;
    .${selectClasses.select} {
      border-radius: 6px;
      background-color: #50515a;
      padding: 8px 10px;
      font-size: 14px;
      font-weight: 600;
    }

    .${inputClasses.input} {
      border: 1px solid #50515a;
      border-radius: 8px 10px;
    }
  `
);
