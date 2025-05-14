import Box from "@mui/material/Box";
import { chipClasses } from "@mui/material/Chip";
import { styled, css, alpha } from "@mui/material/styles";

import { pxToRem } from "@/utils/styleUtils";

export const StyledTitleSection = styled(Box, {
  name: "StyledTitleSection",
})(
  ({ theme }) => css`
    align-items: flex-start;
    display: flex;
    justify-content: space-between;
    padding-top: ${theme.spacing(3)};
    width: 100%;

    h4 {
      color: ${theme.palette.colors.white};
      text-transform: capitalize;
    }
  `
);

export const StyledDetailSection = styled(Box, {
  name: "StyledDetailSection",
})(
  ({ theme }) => css`
    padding-top: ${theme.spacing()};
    width: 100%;

    h6,
    p {
      color: ${theme.palette.colors.gray};
      font-size: ${pxToRem(16)};
      font-style: normal;
      font-weight: 500;
      line-height: normal;
      text-transform: capitalize;
    }
  `
);

export const StyledNotesSection = styled(Box, {
  name: "StyledNotesSection",
})(
  ({ theme }) => css`
    padding-top: ${theme.spacing(3)};
    width: 100%;

    h5 {
      color: ${theme.palette.colors.white};
      font-size: ${pxToRem(22)};
      font-style: normal;
      font-weight: 400;
      line-height: normal;
      text-transform: capitalize;
    }

    .description {
      background: ${alpha(theme.palette.common.white, 0.15)};
      border-radius: 12px;
      gap: 10px;
      margin-top: ${theme.spacing(2)};
      padding: 20px;

      p {
        color: ${theme.palette.colors.white};
        font-size: ${pxToRem(12)};
        font-style: normal;
        font-weight: 400;
        line-height: normal;
      }
    }
  `
);

export const TagsContainer = styled(Box, {
  name: "TagsContainer",
})(
  ({ theme }) => css`
    display: flex;
    gap: 5px;
    padding-top: 20px;

    .${chipClasses.root} {
      border-radius: 6px;
      border: 1px solid ${alpha(theme.palette.common.white, 0.3)};
      cursor: pointer;

      &:hover {
        background: ${theme.palette.colors.white};
        color: ${alpha(theme.palette.common.black, 0.7)};
      }
    }
  `
);
