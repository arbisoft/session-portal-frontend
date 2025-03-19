import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import { cardContentClasses } from "@mui/material/CardContent";
import { styled, css } from "@mui/material/styles";
import { typographyClasses } from "@mui/material/Typography";

import { shouldForwardProp } from "@/utils/styleUtils";

export const SearchVideoCardContainer = styled(Card, {
  name: "SearchVideoCardContainer",
  shouldForwardProp,
})<{ $width: string }>(({ theme, $width }) => {
  return css`
    display: flex;
    background-color: transparent;
    background-image: unset;
    border-radius: ${theme.shape.borderRadius + 8}px;
    overflow: hidden;
    width: ${$width};
    cursor: pointer;

    .${cardContentClasses.root} {
      align-items: flex-start;
      display: flex;
      flex-direction: row;
      gap: ${theme.spacing(2.5)};
      padding: 0;
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
        width: calc(100% - 400px);
        display: flex;
        flex-direction: column;
        gap: 7px;

        .${typographyClasses.h3} {
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          color: ${theme.palette.colors.white};
          display: -webkit-box;
          font-size: 28px;
          font-style: normal;
          font-weight: 500;
          overflow: hidden;
          width: 100%;
        }

        .date-time,
        .organizer-name {
          color: ${theme.palette.colors.gray};
          font-size: 18px;
          font-style: normal;
          font-weight: 500;
          letter-spacing: 0.4px;
        }

        .video-description {
          -webkit-line-clamp: 4;
          display: -webkit-box;
          color: ${theme.palette.colors.white};
          font-size: 16px;
          font-style: normal;
          font-weight: 500;
          line-height: 29px;
          letter-spacing: 0.4px;
          padding-top: 10px;
          overflow: hidden;
          text-overflow: ellipsis;
          -webkit-box-orient: vertical;
        }
      }
    }

    ${theme.breakpoints.down("lg")} {
      height: 100%;

      .${cardContentClasses.root} {
        flex-direction: column;

        .video-detail {
          width: 100%;

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
