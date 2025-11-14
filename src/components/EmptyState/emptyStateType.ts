import { ReactNode } from "react";

type ImageType = {
  alt: string;
  height: number;
  src: string;
  width: number;
};

export type EmptyStateProps = Partial<{
  className: string;
  ctas: ReactNode[];
  heading: ReactNode;
  image: ImageType;
  text: ReactNode;
  icon: ReactNode;
}>;
