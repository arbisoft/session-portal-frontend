import Card from "@mui/material/Card";
import { cardContentClasses } from "@mui/material/CardContent";
import { ratingClasses } from "@mui/material/Rating";
import { styled, css } from "@mui/material/styles";
import { typographyClasses } from "@mui/material/Typography";

import { shouldForwardProp } from "@/utils/styleUtils";

export const VideoCardContainer = styled(Card, {
  name: "VideoCardContainer",
  shouldForwardProp,
})<{ $width: string }>(({ theme, $width }) => {
  return css`
    display: flex;
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
        padding-bottom: 10px;
      }

      img {
        width: 315px;
        height: auto;
        border-radius: ${theme.shape.borderRadius + 2}px;
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

        .${ratingClasses.iconFilled} {
          color: ${theme.palette.colors.gold};
        }
      }
    }
  `;
});
