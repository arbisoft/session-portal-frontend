import { fireEvent, render, screen } from "@testing-library/react";

import Button from "./button";

describe("Button", () => {
  describe("normal", () => {
    it("should render its children and forward clicks", () => {
      const onClick = jest.fn();
      render(<Button onClick={onClick}>Save</Button>);

      fireEvent.click(screen.getByRole("button", { name: "Save" }));

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("should show a loading label with a spinner and disable itself while loading", () => {
      render(<Button loading>Save</Button>);

      const button = screen.getByRole("button", { name: /loading/i });
      expect(button).toBeDisabled();
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
      expect(screen.queryByText("Save")).not.toBeInTheDocument();
    });

    it("should honour the disabled prop when not loading", () => {
      render(<Button disabled>Save</Button>);

      expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    it("should render nothing inside the button when no children are given", () => {
      render(<Button aria-label="empty" />);

      expect(screen.getByRole("button", { name: "empty" })).toBeEmptyDOMElement();
    });
  });

  describe("icon", () => {
    it("should render the children as the start icon and forward clicks", () => {
      const onClick = jest.fn();
      render(
        <Button buttonType="icon" aria-label="favourite" onClick={onClick}>
          <span data-testid="icon" />
        </Button>
      );

      fireEvent.click(screen.getByRole("button", { name: "favourite" }));

      expect(screen.getByTestId("icon")).toBeInTheDocument();
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("should swap the icon for a spinner and disable itself while loading", () => {
      render(
        <Button buttonType="icon" aria-label="favourite" loading>
          <span data-testid="icon" />
        </Button>
      );

      expect(screen.getByRole("button", { name: "favourite" })).toBeDisabled();
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
      expect(screen.queryByTestId("icon")).not.toBeInTheDocument();
    });

    it("should honour the disabled prop when not loading", () => {
      render(<Button buttonType="icon" aria-label="favourite" disabled />);

      expect(screen.getByRole("button", { name: "favourite" })).toBeDisabled();
    });
  });
});
