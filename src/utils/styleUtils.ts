export const shouldForwardProp = (propName: string) => !propName.startsWith("$");

export const pxToRem = (px: number, base = 16): string => {
  return `${px / base}rem`;
};
