import { customRender as render, fireEvent, screen } from "@/jest/utils/testUtils";

import ConfirmDialog from "./confirmDialog";

const setup = (open = true) => {
  const onConfirm = jest.fn();
  const onCancel = jest.fn();
  render(
    <ConfirmDialog
      open={open}
      title="Discard it?"
      description="This cannot be undone."
      confirmLabel="Discard"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
  return { onConfirm, onCancel };
};

describe("ConfirmDialog", () => {
  it("should be an accessible dialog with its title and description", () => {
    setup();

    const dialog = screen.getByRole("dialog", { name: "Discard it?" });
    expect(dialog).toHaveAccessibleDescription("This cannot be undone.");
  });

  it("should focus the safe choice first", () => {
    setup();

    expect(screen.getByRole("button", { name: "Keep going" })).toHaveFocus();
  });

  it("should call the matching handler for each button", () => {
    const { onConfirm, onCancel } = setup();

    fireEvent.click(screen.getByRole("button", { name: "Discard" }));
    fireEvent.click(screen.getByRole("button", { name: "Keep going" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("should render nothing while closed", () => {
    setup(false);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
