import Box from "@mui/material/Box";
import { chipClasses } from "@mui/material/Chip";
import { ratingClasses } from "@mui/material/Rating";
import { styled, css } from "@mui/material/styles";

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
      font-size: 20px;
      font-style: normal;
      font-weight: 500;
      line-height: 26px;
      text-transform: capitalize;
      width: 50%;
    }

    .${ratingClasses.iconFilled} {
      color: ${theme.palette.colors.gold};
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
      font-size: 16px;
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
      font-size: 22px;
      font-style: normal;
      font-weight: 400;
      line-height: normal;
      text-transform: capitalize;
    }

    .description {
      background: #ffffff26;
      border-radius: 12px;
      gap: 10px;
      margin-top: ${theme.spacing(2)};
      padding: 20px;

      p {
        color: ${theme.palette.colors.white};
        font-size: 12px;
        font-style: normal;
        font-weight: 400;
        line-height: normal;
        text-transform: capitalize;
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
    padding-bottom: 10px;

    .${chipClasses.root} {
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.3);

      &.${chipClasses.filled} {
        background: ${theme.palette.colors.white};
        color: rgba(0, 0, 0, 0.7);
      }

      .${chipClasses.icon} {
        margin: 0;
      }

      &.icon {
        padding-left: ${theme.spacing()};
        max-width: unset;
        min-height: unset;
        width: unset;
      }
    }
  `
);
