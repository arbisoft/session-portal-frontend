import Box from "@mui/material/Box";
import { chipClasses } from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import { styled, css } from "@mui/material/styles";
import { typographyClasses } from "@mui/material/Typography";

export const VideoListingContainer = styled(Stack, {
  name: "VideoListingContainer",
})(
  ({ theme }) => css`
    flex-direction: row;
    flex-wrap: wrap;
    gap: ${theme.spacing(3)};
    padding-top: ${theme.spacing(3)};
  `
);

export const FilterBox = styled(Box, {
  name: "FilterBox",
})(
  ({ theme }) => css`
    .${typographyClasses.h2} {
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      color: ${theme.palette.colors.white};
      display: -webkit-box;
      font-size: 24px;
      font-style: normal;
      font-weight: 500;
      letter-spacing: 0.4px;
      line-height: 28px;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-bottom: 10px;
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
      cursor: pointer;
      &.${chipClasses.filled} {
        background: ${theme.palette.colors.white};
        color: rgba(0, 0, 0, 0.7);
      }

      .${chipClasses.icon} {
        margin: 0;
      }
    }
  `
);
