import { FC, ReactNode, useState } from "react";

import ArrowForward from "@mui/icons-material/ArrowForward";
import Box from "@mui/material/Box";
import MuiButton from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import useTheme from "@mui/material/styles/useTheme";
import { Meta } from "@storybook/react";
import chunk from "lodash/chunk";
import startCase from "lodash/startCase";

import Button from "./button";
import { ButtonColor, ButtonProps } from "./buttonTypes";

export default {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: undefined,
  parameters: { jest: "button.test.tsx" },
} as Meta;

type States = "normal" | "disabled" | "loading" | "active";

const createButtonProps = (buttonType: "normal" | "icon", options?: Partial<ButtonProps>) =>
  ({
    buttonType,
    children: "Primary Button",
    color: "primary",
    variant: "contained",
    ...options,
  }) as ButtonProps;

const createIconButtonProps = (icon: ReactNode, options?: Partial<ButtonProps>): ButtonProps =>
  ({ buttonType: "icon", children: icon, color: "primary", variant: "contained", ...options }) as ButtonProps;

const normal: ButtonProps = createButtonProps("normal");

const startIcon: ButtonProps = createButtonProps("normal", {
  startIcon: <ArrowForward />,
});

const endIcon: ButtonProps = createButtonProps("normal", {
  endIcon: <ArrowForward />,
});

const bothIcon: ButtonProps = createButtonProps("normal", {
  startIcon: <ArrowForward />,
  endIcon: <ArrowForward />,
});

const iconButton: ButtonProps = createIconButtonProps(<ArrowForward />);
const variation: ButtonProps[] = [normal, startIcon, endIcon, bothIcon, iconButton];

const variants: Record<ButtonColor, Record<States, ButtonProps[]>> = {
  secondary: {
    normal: variation.map((button) => ({
      ...button,
      color: "secondary",
    })),
    active: variation.map((button) => ({
      ...button,
      color: "secondary",
      isActive: true,
    })),
    disabled: variation.map((button) => ({
      ...button,
      color: "secondary",
      disabled: true,
    })),
    loading: variation.map((button) => ({
      ...button,
      color: "secondary",
      loading: true,
    })),
  },
  primary: {
    normal: variation.map((button) => ({
      ...button,
    })),
    active: variation.map((button) => ({
      ...button,
      isActive: true,
    })),
    disabled: variation.map((button) => ({
      ...button,
      disabled: true,
    })),
    loading: variation.map((button) => ({
      ...button,
      loading: true,
    })),
  },
};

const ColorComponent: FC<{
  color: ButtonColor;
  variant?: "outlined" | "contained";
}> = ({ color, variant }) => {
  const [currentTab, setCurrentTab] = useState<States>("normal");
  const keys = Object.keys(variants[color]) as States[];
  const buttons: ButtonProps[] = variants[color][currentTab];
  const buttonsChunk = chunk(buttons, 3);
  const theme = useTheme();

  const tabsData = keys.map((key) => ({
    key,
    name: startCase(key),
  }));

  return (
    <Box>
      <Box sx={{ marginBottom: theme.spacing(1.25), gap: theme.spacing(0.5), display: "flex" }}>
        {tabsData.map((tab) => (
          <MuiButton
            color="warning"
            key={tab.key}
            onClick={() => setCurrentTab(tab.key)}
            size="small"
            variant={currentTab === tab.key ? "contained" : "outlined"}
          >
            {tab.name}
          </MuiButton>
        ))}
      </Box>
      <Grid container spacing={4}>
        {buttonsChunk.map((val, key) => (
          <Grid item xs={4} key={key}>
            {val.map((button, index) => {
              return (
                <Box key={index} marginBottom={4}>
                  <Button
                    {...button}
                    {...(variant && {
                      variant: variant,
                    })}
                  />
                </Box>
              );
            })}
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export const Primary = () => <ColorComponent color="primary" />;
export const Secondary = () => <ColorComponent color="secondary" />;
export const Contained = () => <ColorComponent color="primary" variant="contained" />;
export const Outlined = () => <ColorComponent color="primary" variant="outlined" />;
