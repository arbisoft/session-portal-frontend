import React, { ReactElement } from "react";

import "@testing-library/jest-dom";
import { render, RenderOptions } from "@testing-library/react";

import ThemeProvider from "@/components/theme/theme-provider";

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) =>
  render(ui, {
    wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
    ...options,
  });

export * from "@testing-library/react";

export { customRender };
