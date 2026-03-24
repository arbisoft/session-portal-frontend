import { screen } from "@testing-library/react";

import { customRender } from "@/jest/utils/testUtils";

import HomePage from "./homePage";

describe("HomePage", () => {
  it("should render without crashing", () => {
    customRender(<HomePage />);
    expect(screen.getByTestId("home-page")).toBeInTheDocument();
  });

  it("should render a skeleton with correct dimensions", () => {
    customRender(<HomePage />);

    const skeleton = screen.getByTestId("home-page").querySelector("span");
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveStyle({
      width: "450px",
      height: "203px",
    });
  });

  it("should render skeleton in center of viewport", () => {
    customRender(<HomePage />);

    const container = screen.getByTestId("home-page");
    expect(container).toHaveStyle({
      width: "100vw",
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    });
  });
});
