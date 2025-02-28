import Card from "@mui/material/Card";
import { cardContentClasses } from "@mui/material/CardContent";
import { skeletonClasses } from "@mui/material/Skeleton";
import { styled, css } from "@mui/material/styles";
import { typographyClasses } from "@mui/material/Typography";

import { shouldForwardProp } from "@/utils/styleUtils";

export const VideoCardContainer = styled(Card, {
  name: "VideoCardContainer",
  shouldForwardProp,
})<{ $width: string }>(({ theme, $width }) => {
  return css`
    display: grid;
    background: transparent;
    overflow: unset;
    border-radius: unset;
    width: ${$width};

    .${cardContentClasses.root} {
      align-items: flex-start;
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing(10 / 8)};
      padding: 0;

      :last-child {
        padding-bottom: 0px;
      }

      img {
        border-radius: ${theme.shape.borderRadius + 8}px;
        height: auto;
        object-fit: cover;
        width: 100%;
      }

      .video-detail {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 7px;

        .${typographyClasses.h3} {
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          color: ${theme.palette.colors.white};
          display: -webkit-box;
          font-size: 16px;
          font-style: normal;
          font-weight: 600;
          letter-spacing: 0.4px;
          line-height: 18.75px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .date-time,
        .organizer-name {
          color: ${theme.palette.colors.gray};
          font-size: 14px;
          font-style: normal;
          font-weight: 500;
          line-height: 17px;
          letter-spacing: 0.4px;
        }
      }
    }
  `;
});

export const ImageWrapper = styled(Card, {
  name: "ImageWrapper",
  shouldForwardProp,
})(({ theme }) => {
  return css`
    position: relative;

    .${skeletonClasses.root} {
      position: absolute;
      z-index: -1;
      top: 0;
    }

    img {
      width: 315px;
      height: auto;
      min-height: 192px;
      border-radius: ${theme.shape.borderRadius + 8}px;
    }

    .${typographyClasses.body2} {
      background-color: rgba(0, 0, 0, 0.7);
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      color: ${theme.palette.colors.white};
      font-size: 12px;
      font-style: normal;
      font-weight: 400;
      line-height: 11.72px;
      border-radius: 2px;
      padding: 2px 4px;
      position: absolute;
      right: 10px;
      bottom: 10px;
      z-index: 9999;
    }
  `;
});
