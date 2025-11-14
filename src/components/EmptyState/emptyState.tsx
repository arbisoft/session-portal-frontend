import { type FC } from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import clsx from "clsx";

import { emptyStateClasses } from "./classes";
import { EmptyStateProps } from "./emptyStateType";
import { ButtonsContainer, Container, Heading, ImageContainer, SVGIconWrapper } from "./styled";

const DEFAULT_IMAGE = {
  src: "/images/empty-state.svg",
  alt: "Bee flying out of an empty box",
  width: 132,
  height: 132,
};

const EmptyState: FC<EmptyStateProps> = ({
  className,
  ctas = [],
  heading = "It looks empty here..",
  icon,
  image = DEFAULT_IMAGE,
  text,
}) => {
  return (
    <Container className={clsx(className, emptyStateClasses.container)} data-testid="empty-state-container">
      <ImageContainer className={emptyStateClasses.imageContainer}>
        {icon ? (
          <SVGIconWrapper className={emptyStateClasses.SVGIconWrapper} data-testid="empty-state-svg-icon-wrapper">
            {icon}
          </SVGIconWrapper>
        ) : (
          <img width={image.width} height={image.height} src={image.src} alt={image.alt} />
        )}
      </ImageContainer>
      <Box maxWidth={462}>
        {heading && (
          <Heading variant="h4" className={emptyStateClasses.heading}>
            {heading}
          </Heading>
        )}
        {typeof text === "string" ? (
          <Typography className={emptyStateClasses.text} fontWeight={300}>
            {text}
          </Typography>
        ) : (
          text
        )}
      </Box>
      {!!ctas.length && <ButtonsContainer className={emptyStateClasses.CTAContainer}>{ctas.map((cta) => cta)}</ButtonsContainer>}
    </Container>
  );
};

export default EmptyState;
