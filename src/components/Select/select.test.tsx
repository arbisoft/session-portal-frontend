import React from "react";

import { act, customRender, fireEvent, screen } from "@/jest/utils/testUtils";

import Select from "./select";
import { SelectProps } from "./types";

describe("Select Component", () => {
  const mockHandleChange = jest.fn();

  const setup = (props?: Partial<SelectProps>) => {
    const defaultProps: SelectProps = {
      menuItems: [
        { value: "one", label: "Option 1" },
        { value: "two", label: "Option 2" },
        { value: "three", label: "Option 3" },
      ],
      handleChange: mockHandleChange,
      value: "",
    };

    return customRender(<Select {...defaultProps} {...props} />);
  };

  it("should render the select component with default option", () => {
    setup();
    expect(screen.getByText("Sort By")).toBeInTheDocument();
  });

  it("should render all menu items", async () => {
    const { getByRole, getByTestId } = setup();
    fireEvent.mouseDown(getByRole("combobox"));
    await act(async () => {
      expect(getByTestId("one")).toBeInTheDocument();
      expect(getByTestId("two")).toBeInTheDocument();
      expect(getByTestId("three")).toBeInTheDocument();
    });
  });

  it("should call handleChange when an option is selected", async () => {
    const { getByTestId, getByRole } = setup();
    fireEvent.mouseDown(getByRole("combobox"));
    await act(async () => {
      getByTestId("one").click();
    });
    expect(mockHandleChange).toHaveBeenCalledTimes(1);
  });

  it("should display the selected value correctly", () => {
    const { getByRole } = setup({ value: "three" });
    expect(getByRole("combobox")).toHaveTextContent("Option 3");
  });

  it("should not crash if menuItems is empty", () => {
    const { getByRole } = setup({ menuItems: [] });
    fireEvent.mouseDown(getByRole("combobox"));
    expect(screen.queryByText("Option 1")).not.toBeInTheDocument();
  });

  test("should match snapshot", () => {
    const { asFragment } = setup();
    expect(asFragment()).toMatchSnapshot();
  });
});
