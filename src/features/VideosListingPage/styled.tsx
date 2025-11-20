import Box from "@mui/material/Box";
import { buttonClasses } from "@mui/material/Button";
import { stackClasses } from "@mui/material/Stack";
import { styled, css, alpha } from "@mui/material/styles";
import { typographyClasses } from "@mui/material/Typography";

import { pxToRem } from "@/utils/styleUtils";

export const VideoListingContainer = styled("div", {
  name: "VideoListingContainer",
})(
  ({ theme }) => css`
    .skeleton-loader,
    .virtuoso-grid-list {
      display: grid;
      gap: ${theme.spacing(3)};
      grid-template-columns: repeat(auto-fill, minmax(396px, 1fr));
      padding-bottom: ${theme.spacing(3)};
      width: 100%;
    }
  `
);

export const FilterBox = styled(Box, {
  name: "FilterBox",
})(
  () => css`
    width: 100%;
    .${stackClasses.root} {
      margin-bottom: 20px;
      width: 100%;

      .${typographyClasses.h2} {
        font-size: ${pxToRem(24)};
        font-weight: 500;
        text-transform: capitalize;
      }
    }
  `
);

export const DropdownContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(0.5),

  [`.${buttonClasses.root}`]: {
    backgroundColor: theme.palette.mode === "dark" ? alpha(theme.palette.common.white, 0.2) : theme.palette.primary.main,
    borderColor: theme.palette.mode === "dark" ? alpha(theme.palette.common.white, 0.3) : theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
    fontSize: pxToRem(14),
    fontWeight: 600,

    "&:hover": {
      borderColor: theme.palette.mode === "dark" ? alpha(theme.palette.common.white, 0.5) : theme.palette.secondary.main,
    },
  },

  [`>.${typographyClasses.root}`]: {
    fontSize: pxToRem(14),
  },

  [theme.breakpoints.up("sm")]: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(1.5),

    [`>.${typographyClasses.root}`]: {
      fontSize: pxToRem(16),
    },
  },
}));
