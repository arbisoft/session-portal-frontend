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
  `;
});
