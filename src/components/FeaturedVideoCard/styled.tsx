import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import { cardContentClasses } from "@mui/material/CardContent";
import { styled, css } from "@mui/material/styles";
import { typographyClasses } from "@mui/material/Typography";

import { shouldForwardProp } from "@/utils/styleUtils";

export const FeaturedVideoCardContainer = styled(Card, {
  name: "FeaturedVideoCardContainer",
  shouldForwardProp,
})<{ $width: string }>(({ theme, $width }) => {
  return css`
    display: flex;
    background-color: rgba(255, 255, 255, 0.06);
    border-radius: 12px;
    padding: 30px;
    border-radius: ${theme.shape.borderRadius + 8}px;
    overflow: hidden;
    width: ${$width};
    margin-top: 10px;

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
          letter-spacing: 0.4px;
          line-height: 35px;
          overflow: hidden;
          text-overflow: ellipsis;
          padding-bottom: 10px;
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
          color: ${theme.palette.colors.white};
          font-size: 18px;
          font-style: normal;
          font-weight: 500;
          line-height: 21px;
          letter-spacing: 0.4px;
          padding-top: 10px;
        }
      }
    }

    ${theme.breakpoints.down("xl")} {
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
