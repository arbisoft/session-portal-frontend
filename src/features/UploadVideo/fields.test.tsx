import { useEffect } from "react";

import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";

import { customRender as render, fireEvent, screen, waitFor } from "@/jest/utils/testUtils";

import { DescriptionField, EventDateField, FormValues, OptionCheckbox, TitleField } from "./fields";

type HarnessProps = {
  children: (control: ReturnType<typeof useForm<FormValues>>["control"]) => React.ReactNode;
  onSubmit?: (values: FormValues) => void;
  errorField?: keyof FormValues;
};

const Harness = ({ children, onSubmit = jest.fn(), errorField }: HarnessProps) => {
  const { control, handleSubmit, setError } = useForm<FormValues>({
    defaultValues: { title: "", description: "", presenter_ids: [], playlists: [], tags: [] },
  });

  useEffect(() => {
    if (errorField) setError(errorField, { message: "Something is wrong" });
  }, [errorField, setError]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {children(control)}
      <button type="submit">submit</button>
    </form>
  );
};

describe("TitleField and DescriptionField", () => {
  it("should submit the typed title and description", async () => {
    const onSubmit = jest.fn();
    render(
      <Harness onSubmit={onSubmit}>
        {(control) => (
          <>
            <TitleField control={control} />
            <DescriptionField control={control} />
          </>
        )}
      </Harness>
    );

    await userEvent.type(screen.getByLabelText(/^Title/), "My talk");
    await userEvent.type(screen.getByLabelText(/^Description/), "About things");
    fireEvent.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ title: "My talk", description: "About things" });
  });

  it.each([
    ["title", TitleField],
    ["description", DescriptionField],
  ] as const)("should display the %s validation message", async (name, Field) => {
    render(<Harness errorField={name}>{(control) => <Field control={control} />}</Harness>);

    expect(await screen.findByText("Something is wrong")).toBeInTheDocument();
  });
});

describe("EventDateField", () => {
  const renderDate = (props: Partial<HarnessProps> = {}) =>
    render(<Harness {...props}>{(control) => <EventDateField control={control} />}</Harness>);

  it("should open the calendar from the calendar icon button", async () => {
    renderDate();

    await userEvent.click(screen.getByRole("button", { name: /choose date/i }));

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("should close the calendar on escape", async () => {
    renderDate();
    await userEvent.click(screen.getByRole("button", { name: /choose date/i }));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("should store the date picked from the calendar", async () => {
    const onSubmit = jest.fn();
    renderDate({ onSubmit });
    await userEvent.click(screen.getByRole("button", { name: /choose date/i }));

    await userEvent.click(await screen.findByRole("gridcell", { name: "15" }));
    fireEvent.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect((onSubmit.mock.calls[0][0] as FormValues).event_date.getDate()).toBe(15);
  });

  it("should display the validation message", async () => {
    renderDate({ errorField: "event_date" });

    expect(await screen.findByText("Something is wrong")).toBeInTheDocument();
  });
});

describe("OptionCheckbox", () => {
  it.each([true, false])("should reflect the checked state (%s)", (checked) => {
    render(<OptionCheckbox checked={checked} />);

    expect(screen.getByRole("checkbox")).toHaveProperty("checked", checked);
  });
});
