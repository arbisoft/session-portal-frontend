import React from "react";
import { CssBaseline } from "@mui/material";
import type { Preview } from "@storybook/react";
import { themes } from "@storybook/theming";
import ThemeProvider from "../src/components/theme/theme-provider";

const preview: Preview = {
  decorators: [
    (Story) => {
      return (
        <ThemeProvider>
          <CssBaseline />
          <Story />
        </ThemeProvider>
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
  },
};

export default preview;
