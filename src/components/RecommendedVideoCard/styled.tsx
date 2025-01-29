import Card from "@mui/material/Card";
import { cardContentClasses } from "@mui/material/CardContent";
import { styled, css } from "@mui/material/styles";
import { typographyClasses } from "@mui/material/Typography";

export const RecommendedVideoCardContainer = styled(Card, {
  name: "RecommendedVideoCardContainer",
})<{ $width: string }>(({ theme, $width }) => {
  return css`
    display: inline-flex;
    padding: 0;
    background: transparent;
    overflow: unset;
    border-radius: unset;
    width: ${$width};

    .${cardContentClasses.root} {
      align-items: flex-start;
      display: flex;
      gap: ${theme.spacing(10 / 8)};
      padding: 0;

      img {
        width: 113px;
        height: auto;
        border-radius: ${theme.shape.borderRadius + 2}px;
      }

      .video-detail {
        display: flex;
        flex-direction: column;
        gap: 7px;

        .${typographyClasses.h5} {
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          color: #fff;
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
          color: #908e8e;
          font-size: 12px;
          font-style: normal;
          font-weight: 500;
          line-height: normal;
          letter-spacing: 0.4px;

          span {
            color: #fff;
          }
        }
      }
    }
  `;
});
