import { useEffect } from "react";

import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";

import { customRender as render, fireEvent, screen, waitFor } from "@/jest/utils/testUtils";

import {
  DescriptionField,
  EventDateField,
  FORM_SCROLL_CONTAINER_ID,
  FormCardHeader,
  FormValues,
  OptionCheckbox,
  TitleField,
} from "./fields";

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
    <div id={FORM_SCROLL_CONTAINER_ID} data-testid="scroll-container">
      <form onSubmit={handleSubmit(onSubmit)}>
        {children(control)}
        <button type="submit">submit</button>
      </form>
    </div>
  );
};

describe("FormCardHeader", () => {
  it("should fall back to a default heading until a title is typed", async () => {
    render(
      <Harness>
        {(control) => (
          <>
            <FormCardHeader control={control} />
            <TitleField control={control} />
          </>
        )}
      </Harness>
    );
    expect(screen.getByText("Upload Video")).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText("Title"), "My talk");

    expect(screen.getByText("My talk")).toBeInTheDocument();
    expect(screen.queryByText("Upload Video")).not.toBeInTheDocument();
  });
});

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

    await userEvent.type(screen.getByLabelText("Title"), "My talk");
    await userEvent.type(screen.getByLabelText("Description"), "About things");
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

  it("should open the calendar when the input is clicked", async () => {
    renderDate();

    await userEvent.click(screen.getByLabelText("Event Date"));

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("should open the calendar from the calendar icon button", async () => {
    renderDate();

    await userEvent.click(screen.getByRole("button", { name: /choose date/i }));

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("should close the calendar on escape", async () => {
    renderDate();
    await userEvent.click(screen.getByLabelText("Event Date"));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("should close the calendar when the form scrolls", async () => {
    renderDate();
    await userEvent.click(screen.getByLabelText("Event Date"));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();

    fireEvent.scroll(screen.getByTestId("scroll-container"));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("should store the date picked from the calendar", async () => {
    const onSubmit = jest.fn();
    renderDate({ onSubmit });
    await userEvent.click(screen.getByLabelText("Event Date"));

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
