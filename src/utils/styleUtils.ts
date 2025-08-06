export const shouldForwardProp = (propName: string) => !propName.startsWith("$");

export const pxToRem = (px: number, base = 16): string => {
  return `${(px * 1.25) / base}rem`;
};
