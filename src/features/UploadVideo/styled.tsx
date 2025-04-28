import Box from "@mui/material/Box";
import { buttonClasses } from "@mui/material/Button";
import Card from "@mui/material/Card";
import { cardActionsClasses } from "@mui/material/CardActions";
import { cardContentClasses } from "@mui/material/CardContent";
import { cardHeaderClasses } from "@mui/material/CardHeader";
import { formLabelClasses } from "@mui/material/FormLabel";
import { styled, css, alpha } from "@mui/material/styles";

export const StyledCard = styled(Card, {
  name: "StyledCard",
})(
  ({ theme }) => css`
    background-color: ${alpha(theme.palette.common.white, 0.1)};
    border-radius: 12px;
    width: 700px;

    .first-step.${cardContentClasses.root} {
      align-items: center;
      display: flex;
      flex-direction: column;
      gap: 20px;
      height: 400px;
      justify-content: center;
      text-align: center;
    }

    .${cardHeaderClasses.root} {
      border-bottom: 1px solid ${alpha(theme.palette.common.white, 0.1)};
    }

    .${cardHeaderClasses.title} {
      font-size: 24px;
      font-weight: 500;
      text-align: left;
      text-transform: capitalize;
    }

    .${cardActionsClasses.root} {
      border-top: 1px solid ${alpha(theme.palette.common.white, 0.1)};
      justify-content: center;
      padding: 20px;

      p {
        font-size: 10px;
        font-style: normal;
        font-weight: 400;
      }
    }
  `
);

export const StyledIconContainer = styled(Box, {
  name: "StyledIconContainer",
})(
  ({ theme }) => css`
    align-items: center;
    background-color: ${alpha(theme.palette.common.black, 0.3)};
    border-radius: 8px;
    display: inline-flex;
    height: 50px;
    justify-content: center;
    width: 50px;
  `
);

export const ImportContainer = styled(Box, {
  name: "ImportContainer",
})(
  () => css`
    align-items: center;
    display: flex;
    gap: 20px;
    width: 60%;
    margin-bottom: 20px;
  `
);

export const InputContainer = styled(Box, {
  name: "InputContainer",
})(
  () => css`
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 20px;

    .${formLabelClasses.root} {
      font-size: 14px;
      font-weight: 400;
    }
  `
);

export const ThumbnailUploaderButtons = styled(Box, {
  name: "ThumbnailUploaderButtons",
})(
  ({ theme }) => css`
    display: flex;
    justify-content: space-between;
    gap: 10px;

    .${buttonClasses.root} {
      border-radius: 12px;
      color: ${theme.palette.common.white};
      padding: 20px 30px;
      width: 50%;
    }
  `
);
