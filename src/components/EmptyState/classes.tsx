import generateUtilityClasses from "@mui/material/generateUtilityClasses";

export type EmptyStateClasses = {
  container: string;
  CTAContainer: string;
  imageContainer: string;
  text: string;
  heading: string;
  SVGIconWrapper: string;
};

export const emptyStateClasses: EmptyStateClasses = generateUtilityClasses("EmptyState", [
  "container",
  "CTAContainer",
  "imageContainer",
  "text",
  "heading",
  "SVGIconWrapper",
]);
