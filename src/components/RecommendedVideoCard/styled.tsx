import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import { cardContentClasses } from "@mui/material/CardContent";
import { ratingClasses } from "@mui/material/Rating";
import { styled, css, alpha } from "@mui/material/styles";
import { typographyClasses } from "@mui/material/Typography";

import { shouldForwardProp } from "@/utils/styleUtils";

export const RecommendedVideoCardContainer = styled(Card, {
  name: "RecommendedVideoCardContainer",
  shouldForwardProp,
})<{ $width: string }>(({ theme, $width }) => {
  return css`
    background: transparent;
    border-radius: unset;
    cursor: pointer;
    display: inline-flex;
    overflow: unset;
    padding: 0;
    width: ${$width};

    .${cardContentClasses.root} {
      align-items: flex-start;
      display: flex;
      gap: ${theme.spacing(10 / 8)};
      padding: 0;

      :last-child {
        padding-bottom: 10px;
      }

      img {
        border-radius: ${theme.shape.borderRadius + 2}px;
        height: unset;
        width: 113px;
      }

      .video-detail {
        display: flex;
        flex-direction: column;
        gap: 7px;

        .${typographyClasses.h5} {
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          color: ${theme.palette.colors.white};
          display: -webkit-box;
          font-size: 12px;
          font-style: normal;
          font-weight: 500;
          letter-spacing: 0.4px;
          line-height: normal;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 95%;
        }

        .date-time {
          color: ${theme.palette.colors.gray};
          font-size: 12px;
          font-style: normal;
          font-weight: 500;
          line-height: normal;
          letter-spacing: 0.4px;

          span {
            color: ${theme.palette.colors.white};
          }
        }

        .${ratingClasses.iconFilled} {
          color: ${theme.palette.colors.gold};
        }
      }
    }
  `;
});

export const ImageContainer = styled(Box, {
  name: "ImageContainer",
})(({ theme }) => {
  return css`
    border-radius: ${theme.shape.borderRadius + 2}px;
    height: 73px;
    overflow: hidden;
    position: relative;

    .duration {
      background-color: ${alpha(theme.palette.common.black, 0.7)};
      border-radius: 2px;
      bottom: 6px;
      color: ${theme.palette.colors.white};
      font-size: 12px;
      padding: 2px 4px;
      position: absolute;
      right: 6px;
      z-index: 9999;
    }
  `;
});
