import Box from "@mui/material/Box";
import { stackClasses } from "@mui/material/Stack";
import { styled, css } from "@mui/material/styles";
import { typographyClasses } from "@mui/material/Typography";

import { pxToRem } from "@/utils/styleUtils";

export const VideoListingContainer = styled("div", {
  name: "VideoListingContainer",
})(({ theme }) => ({
  [".skeleton-loader, .virtuoso-grid-list"]: {
    display: "grid",
    columnGap: theme.spacing(2),
    rowGap: theme.spacing(3.5),
    width: "100%",
    gridTemplateColumns: "repeat(1, minmax(0, 1fr))",

    [theme.breakpoints.up("sm")]: {
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    },

    [theme.breakpoints.up("lg")]: {
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    },
  },
}));

export const FilterBox = styled(Box, {
  name: "FilterBox",
})(
  () => css`
    width: 100%;
    .${stackClasses.root} {
      width: 100%;

      .${typographyClasses.h2} {
        font-size: ${pxToRem(24)};
        font-weight: 500;
        text-transform: capitalize;
      }
    }
  `
);
