import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import { cardContentClasses } from "@mui/material/CardContent";
import { skeletonClasses } from "@mui/material/Skeleton";
import { styled, css, alpha } from "@mui/material/styles";
import { typographyClasses } from "@mui/material/Typography";

import { shouldForwardProp } from "@/utils/styleUtils";

export const VideoCardContainer = styled(Card, {
  name: "VideoCardContainer",
  shouldForwardProp,
})<{ $width: string }>(({ theme, $width }) => {
  return css`
    background: transparent;
    border-radius: unset;
    cursor: pointer;
    display: grid;
    overflow: unset;
    width: ${$width};

    .${cardContentClasses.root} {
      align-items: flex-start;
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing(10 / 8)};
      padding: 0;
      width: 100%;

      :last-child {
        padding-bottom: 0px;
      }

      img {
        border-radius: ${theme.shape.borderRadius + 8}px;
        height: auto;
        max-height: 192px;
        min-height: 192px;
        object-fit: cover;
        width: 100%;
      }

      .${skeletonClasses.root} {
        border-radius: ${theme.shape.borderRadius + 8}px;
        position: absolute;
        top: 0;
        z-index: -1;
        width: 100%;
        height: 100%;
      }

      .video-detail {
        display: flex;
        flex-direction: column;
        gap: 7px;
        width: 100%;

        .${typographyClasses.h1}, .${typographyClasses.h5}, .${typographyClasses.h3} {
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          color: ${theme.palette.colors.white};
          display: -webkit-box;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .date-time,
        .organizer-name {
          color: ${theme.palette.colors.gray};
          font-size: 14px;
          font-weight: 500;
        }

        .video-description {
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 4;
          color: ${theme.palette.colors.white};
          display: -webkit-box;
          font-size: 18px;
          font-weight: 500;
          overflow: hidden;

          ${theme.breakpoints.down("md")} {
            -webkit-line-clamp: 2;
          }
        }
      }
    }

    &.normal-card {
      .${cardContentClasses.root} {
        .video-detail {
          .${typographyClasses.h3} {
            font-size: 16px;
            font-weight: 600;
          }
        }
      }
    }

    &.related-card {
      display: flex;
      margin-bottom: 20px;
      width: 100%;

      .${cardContentClasses.root} {
        flex-direction: row;
        gap: 10px;

        .image-wrapper {
          border-radius: ${theme.shape.borderRadius + 2}px;
          overflow: hidden;
          width: 113px;

          .video-player {
            border-radius: ${theme.shape.borderRadius + 2}px;
          }

          img {
            border-radius: ${theme.shape.borderRadius + 2}px;
            height: unset;
            max-height: unset;
            min-height: unset;
          }

          .${skeletonClasses.root} {
            border-radius: ${theme.shape.borderRadius + 2}px;
          }
        }

        .video-detail {
          gap: 4px;
          width: calc(100% - 113px);

          .${typographyClasses.h5} {
            font-size: 12px;
            font-weight: 500;
          }

          .organizer-name,
          .date-time {
            color: ${theme.palette.colors.gray};
            font-size: 12px;
          }
        }
      }
    }

    &.featured-card {
      background-color: ${alpha(theme.palette.common.white, 0.06)};
      border-radius: 12px;
      display: flex;
      padding: 30px;

      .${cardContentClasses.root} {
        flex-direction: row;
        gap: ${theme.spacing(2.5)};

        ${theme.breakpoints.down("sm")} {
          flex-direction: column;
        }

        .image-wrapper {
          border-radius: ${theme.shape.borderRadius + 8}px;
          height: auto;
          object-fit: cover;
          width: 400px;

          ${theme.breakpoints.down("md")} {
            width: 300px;
          }

          ${theme.breakpoints.down("sm")} {
            width: 100%;
          }

          img {
            border-radius: ${theme.shape.borderRadius + 8}px;
            height: unset;
            max-height: unset;
            min-height: unset;
          }

          .${skeletonClasses.root} {
            border-radius: ${theme.shape.borderRadius + 8}px;
          }
        }

        .video-detail {
          width: calc(100% - 430px);
          gap: 10px;

          ${theme.breakpoints.down("md")} {
            width: calc(100% - 320px);
          }

          ${theme.breakpoints.down("sm")} {
            width: 100%;
          }

          .${typographyClasses.h1} {
            font-weight: 500;
          }

          .organizer-name,
          .date-time {
            font-size: 18px;
          }
        }
      }
    }

    &.search-card {
      display: flex;

      .${cardContentClasses.root} {
        flex-direction: row;
        gap: ${theme.spacing(2.5)};

        ${theme.breakpoints.down("sm")} {
          flex-direction: column;
        }

        .image-wrapper {
          border-radius: ${theme.shape.borderRadius + 8}px;
          width: 400px;

          ${theme.breakpoints.down("md")} {
            width: 300px;
          }

          ${theme.breakpoints.down("sm")} {
            width: 100%;
          }

          img {
            border-radius: ${theme.shape.borderRadius + 8}px;
            height: unset;
            max-height: unset;
            min-height: unset;
          }

          .${skeletonClasses.root} {
            border-radius: ${theme.shape.borderRadius + 8}px;
          }
        }

        .video-detail {
          width: calc(100% - 430px);
          gap: 10px;

          ${theme.breakpoints.down("md")} {
            width: calc(100% - 320px);
          }

          ${theme.breakpoints.down("sm")} {
            width: 100%;
          }

          .${typographyClasses.h1} {
            font-weight: 500;
          }

          .organizer-name,
          .date-time {
            font-size: 18px;
          }
        }
      }
    }

    // for storybook
    &.custom-video-card {
      .${cardContentClasses.root} {
        .video-detail {
          * {
            color: ${theme.palette.secondary.main};
          }
        }
      }
    }
  `;
});

export const ImageWrapper = styled(Box, {
  name: "ImageWrapper",
})(({ theme }) => {
  return css`
    display: inline-flex;
    position: relative;
    width: 100%;

    .video-player {
      border-radius: ${theme.shape.borderRadius + 8}px;
      height: 100%;
      left: 0;
      object-fit: cover;
      position: absolute;
      top: 0;
      width: 100%;
      z-index: 2;
    }

    .video-duration {
      background-color: ${alpha(theme.palette.common.black, 0.7)};
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
