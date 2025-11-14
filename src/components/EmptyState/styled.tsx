import { css, styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";

export const Container = styled("div", {
  name: "Container",
})(
  ({ theme }) => css`
    align-items: center;
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: ${theme.spacing(16, 0)};
    text-align: center;
    width: 100%;
  `
);

export const ImageContainer = styled("div", {
  name: "ImageContainer",
})(
  ({ theme }) => css`
    margin-bottom: ${theme.spacing(2)};
  `
);

export const Heading = styled(Typography)(
  ({ theme }) => css`
    && {
      margin-bottom: ${theme.spacing(2)};
    }
  `
);

export const ButtonsContainer = styled("div", {
  name: "ButtonsContainer",
})(
  ({ theme }) => css`
    display: flex;
    gap: ${theme.spacing(5)};
    margin-top: ${theme.spacing(5)};
  `
);

export const SVGIconWrapper = styled("div", {
  name: "SVGIconWrapper",
})(
  () => css`
    align-items: center;
    border-radius: 50%;
    display: flex;
    height: 96px;
    justify-content: center;
    width: 96px;
  `
);
