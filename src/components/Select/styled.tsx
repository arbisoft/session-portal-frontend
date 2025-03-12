import FormControl from "@mui/material/FormControl";
import { inputClasses } from "@mui/material/Input";
import { selectClasses } from "@mui/material/Select";
import { styled, css, alpha } from "@mui/material/styles";

export const SelectFormControl = styled(FormControl, {
  name: "SelectFormControl",
})(
  ({ theme }) => css`
    min-width: 124px;
    .${selectClasses.select} {
      background-color: ${alpha(theme.palette.colors.white, 0.2)};
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      padding: 8px 10px;
    }

    .${inputClasses.input} {
      border-radius: 8px 10px;
      border: 1px solid ${alpha(theme.palette.colors.white, 0.2)};
    }
  `
);
