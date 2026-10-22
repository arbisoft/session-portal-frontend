import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import { cardActionsClasses } from "@mui/material/CardActions";
import { cardHeaderClasses } from "@mui/material/CardHeader";
import { chipClasses } from "@mui/material/Chip";
import { formLabelClasses } from "@mui/material/FormLabel";
import { styled, css, alpha, lighten } from "@mui/material/styles";

import { shouldForwardProp } from "@/utils/styleUtils";

// Kept low enough that text.secondary (#908e8e) still reaches 4.5:1 on the tinted card.
const SURFACE_TINT = 0.08;

export const StyledCard = styled(Card, {
  name: "StyledCard",
})(
  ({ theme }) => css`
    background-color: ${alpha(theme.palette.common.white, SURFACE_TINT)};
    border-radius: ${theme.spacing(1)};
    margin-inline: auto;
    max-width: ${theme.breakpoints.values.lg}px;
    /* MUI Card defaults to overflow: hidden, which would stop the footer from sticking to the viewport. */
    overflow: visible;
    width: 100%;

    .${cardHeaderClasses.root} {
      border-bottom: 1px solid ${theme.palette.divider};
    }

    .${cardHeaderClasses.title} {
      font-size: ${theme.typography.h2.fontSize};
      font-weight: 500;
      text-align: left;
    }

    .${cardActionsClasses.root} {
      align-items: center;
      /* Opaque (the card tint alone would let scrolled content show through) yet identical to the tinted card. */
      background-color: ${lighten(theme.palette.background.default, SURFACE_TINT)};
      border-radius: 0 0 ${theme.spacing(1)} ${theme.spacing(1)};
      border-top: 1px solid ${theme.palette.divider};
      bottom: 0;
      box-sizing: border-box;
      min-height: ${theme.spacing(9.5)};
      padding: ${theme.spacing(2, 3)};
      position: sticky;
      z-index: 1;
    }
  `
);

// White "primary action" button used on the dark upload card (Select File, Publish).
export const inverseButtonSx = {
  backgroundColor: "common.white",
  color: "primary.main",
  "&:hover": { backgroundColor: "grey.300" },
};

export const InputContainer = styled(Box, {
  name: "InputContainer",
})(
  ({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing(1)};
    margin-bottom: ${theme.spacing(2.5)};

    .${formLabelClasses.root} {
      color: ${theme.palette.text.primary};
      font-size: ${theme.typography.bodyMedium.fontSize};
      font-weight: 400;
    }

    .${formLabelClasses.asterisk} {
      color: ${theme.palette.text.secondary};
    }

    .${chipClasses.root} {
      border-radius: 6px;
    }
  `
);

export const Dropzone = styled(Box, {
  name: "Dropzone",
  shouldForwardProp,
})<{ $isDragOver: boolean }>(
  ({ theme, $isDragOver }) => css`
    align-items: center;
    background-color: ${alpha(theme.palette.common.white, $isDragOver ? 0.12 : 0.03)};
    border: 2px dashed ${alpha(theme.palette.common.white, $isDragOver ? 0.9 : 0.35)};
    border-radius: ${theme.spacing(1)};
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing(1.5)};
    padding: ${theme.spacing(5, 2)};
    text-align: center;
  `
);
