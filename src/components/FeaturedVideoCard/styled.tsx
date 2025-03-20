import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import { cardContentClasses } from "@mui/material/CardContent";
import { styled, css, alpha } from "@mui/material/styles";
import { typographyClasses } from "@mui/material/Typography";

import { shouldForwardProp } from "@/utils/styleUtils";

export const FeaturedVideoCardContainer = styled(Card, {
  name: "FeaturedVideoCardContainer",
  shouldForwardProp,
})<{ $width: string }>(({ theme, $width }) => {
  return css`
    background-color: ${alpha(theme.palette.common.white, 0.06)};
    border-radius: ${theme.shape.borderRadius + 8}px;
    border-radius: 12px;
    cursor: pointer;
    display: flex;
    padding: 30px;
    width: ${$width};

    .${cardContentClasses.root} {
      align-items: flex-start;
      display: flex;
      flex-direction: row;
      gap: ${theme.spacing(2.5)};
      padding: 0;
      width: 100%;

      :last-child {
        padding: 0;
      }

      img {
        border-radius: ${theme.shape.borderRadius + 8}px;
        height: auto;
        object-fit: cover;
        width: 400px;
      }

      .video-detail {
        width: calc(100% - 430px);
        display: flex;
        flex-direction: column;
        gap: 7px;

        .${typographyClasses.h1} {
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          color: ${theme.palette.colors.white};
          display: -webkit-box;
          font-weight: 500;
          overflow: hidden;
          padding-bottom: 10px;
          width: 100%;
        }

        .date-time,
        .organizer-name {
          color: ${theme.palette.colors.gray};
          font-size: 18px;
          font-style: normal;
          font-weight: 500;
          line-height: 17px;
          letter-spacing: 0.4px;
        }

        .video-description {
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 4;
          color: ${theme.palette.colors.white};
          display: -webkit-box;
          font-size: 18px;
          font-weight: 500;
          overflow: hidden;
          padding-top: 10px;
        }
      }
    }

    ${theme.breakpoints.down("lg")} {
      .${cardContentClasses.root} {
        .video-detail {
          .${typographyClasses.h3} {
            font-size: 20px;
            line-height: 24px;
          }
          .date-time,
          .organizer-name {
            font-size: 14px;
            line-height: 14px;
          }
          .video-description {
            font-size: 14px;
            line-height: 14px;
          }
        }
      }
    }

    ${theme.breakpoints.down("lg")} {
      padding: ${theme.spacing(1)};
      .${cardContentClasses.root} {
        flex-direction: column;
        img {
          width: 225px;
          height: 170px;
        }
      }
    }
  `;
});

export const ImageContainerBox = styled(Box, {
  name: "ImageContainerBox",
  shouldForwardProp,
})(({ theme }) => {
  return css`
    position: relative;
    display: inline-flex;

    .video-duration {
      background-color: rgba(0, 0, 0, 0.7);
      border-radius: 2px;
      bottom: 10px;
      color: ${theme.palette.colors.white};
      font-size: 12px;
      padding: 2px 4px;
      position: absolute;
      right: 10px;
      z-index: 1;
    }
  `;
});
