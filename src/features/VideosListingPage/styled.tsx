import Box from "@mui/material/Box";
import { chipClasses } from "@mui/material/Chip";
import { stackClasses } from "@mui/material/Stack";
import { styled, css } from "@mui/material/styles";
import { typographyClasses } from "@mui/material/Typography";

export const VideoListingContainer = styled("div", {
  name: "VideoListingContainer",
})(
  ({ theme }) => css`
    display: grid;
    gap: ${theme.spacing(3)};
    grid-template-columns: repeat(auto-fill, minmax(287px, 1fr));
    padding-top: ${theme.spacing(3)};
    width: 100%;
  `
);

export const FilterBox = styled(Box, {
  name: "FilterBox",
})(
  ({ theme }) => css`
    width: 100%;
    .${stackClasses.root} {
      flex-direction: row;
      justify-content: space-between;
      width: 100%;
      margin-bottom: 10px;

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
    overflow-x: scroll;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      display: none;
    }

    .${chipClasses.root} {
      flex: 0 0 auto;
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.3);
      cursor: pointer;
      text-transform: capitalize;
      scroll-snap-align: start;

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
