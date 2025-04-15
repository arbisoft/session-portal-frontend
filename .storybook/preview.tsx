import React from "react";
import { CssBaseline } from "@mui/material";
import type { Preview } from "@storybook/react";
import { themes } from "@storybook/theming";
import ThemeProvider from "../src/components/theme/theme-provider";
import {Providers} from "../src/redux/store/provider";

const preview: Preview = {
  decorators: [
    (Story) => {
      return (
        <Providers>
          <ThemeProvider>
            <CssBaseline />
            <Story />
          </ThemeProvider>
        </Providers>
      );
    },
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      theme: themes.dark,
    },
    nextjs: {
      appDirectory: true,
    },
  },
};

export default preview;
