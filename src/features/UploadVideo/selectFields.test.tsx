import { useEffect } from "react";

import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";

import { customRender as render, fireEvent, screen, waitFor } from "@/jest/utils/testUtils";

import { FORM_SCROLL_CONTAINER_ID, FormValues } from "./fields";
import { PlaylistsField, PresenterField, TagsField } from "./selectFields";

const mockSearchUsers = jest.fn();
let mockUserSearchState: { data: unknown[]; isFetching: boolean } = { data: [], isFetching: false };

jest.mock("@/redux/events/apiSlice", () => ({
  useAllTagsQuery: () => ({
    data: [
      { id: 1, name: "react" },
      { id: 2, name: "testing" },
    ],
  }),
  usePlaylistsQuery: () => ({
    data: [
      { id: 10, name: "Frontend" },
      { id: 11, name: "Backend" },
    ],
  }),
  useLazySearchUsersQuery: () => [mockSearchUsers, mockUserSearchState],
}));

const alice = { id: 1, first_name: "Alice", last_name: "Smith", full_name: "Alice Smith", email: "alice@example.com" };
const nameless = { id: 2, first_name: "Bob", last_name: "Jones", full_name: "", email: "bob@example.com" };

type HarnessProps = {
  Field: typeof PresenterField;
  onSubmit: (values: FormValues) => void;
  errorField?: keyof FormValues;
};

const Harness = ({ Field, onSubmit, errorField }: HarnessProps) => {
  const { control, handleSubmit, setError } = useForm<FormValues>({
    defaultValues: { title: "", description: "", presenter_ids: [], playlists: [], tags: [] },
  });

  useEffect(() => {
    if (errorField) setError(errorField, { message: "Something is wrong" });
  }, [errorField, setError]);

  return (
    <div id={FORM_SCROLL_CONTAINER_ID} data-testid="scroll-container">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Field control={control} />
        <button type="submit">submit</button>
      </form>
    </div>
  );
};

const setup = (Field: HarnessProps["Field"], errorField?: keyof FormValues) => {
  const onSubmit = jest.fn();
  const utils = render(<Harness Field={Field} onSubmit={onSubmit} errorField={errorField} />);
  const submit = async () => {
    fireEvent.click(screen.getByRole("button", { name: "submit" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    return onSubmit.mock.calls[0][0] as FormValues;
  };
  return { ...utils, onSubmit, submit };
};

describe("PresenterField", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUserSearchState = { data: [], isFetching: false };
  });

  it("should not search or open the dropdown for fewer than two characters", async () => {
    setup(PresenterField);

    await userEvent.type(screen.getByLabelText("Presenter"), "a");

    expect(mockSearchUsers).not.toHaveBeenCalled();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("should search with the trimmed query and list the matching users", async () => {
    mockUserSearchState = { data: [alice], isFetching: false };
    setup(PresenterField);

    await userEvent.type(screen.getByLabelText("Presenter"), "al ");

    expect(mockSearchUsers).toHaveBeenLastCalledWith("al");
    expect(await screen.findByText(/Alice Smith — alice@example\.com/)).toBeInTheDocument();
  });

  it("should store the ids of the selected presenters", async () => {
    mockUserSearchState = { data: [alice, nameless], isFetching: false };
    const { submit } = setup(PresenterField);

    await userEvent.type(screen.getByLabelText("Presenter"), "bo");
    await userEvent.click(await screen.findByText(/bob@example\.com/, { selector: "li" }));

    expect((await submit()).presenter_ids).toEqual([2]);
    // A user without a full name falls back to first and last name for the chip label.
    expect(screen.getByRole("button", { name: "Bob Jones" })).toBeInTheDocument();
  });

  it("should mark an already selected presenter as selected when it shows up in later results", async () => {
    mockUserSearchState = { data: [alice, nameless], isFetching: false };
    setup(PresenterField);
    const input = screen.getByLabelText("Presenter");

    await userEvent.type(input, "al");
    await userEvent.click(await screen.findByText(/alice@example\.com/, { selector: "li" }));
    await userEvent.type(input, "bo");

    const selectedOption = await screen.findByRole("option", { name: /alice@example\.com/ });
    expect(selectedOption).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("option", { name: /bob@example\.com/ })).toHaveAttribute("aria-selected", "false");
  });

  it("should close the dropdown when the form scrolls", async () => {
    mockUserSearchState = { data: [alice], isFetching: false };
    setup(PresenterField);
    await userEvent.type(screen.getByLabelText("Presenter"), "al");
    expect(await screen.findByRole("listbox")).toBeInTheDocument();

    fireEvent.scroll(screen.getByTestId("scroll-container"));

    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument());
  });

  it("should close the dropdown on escape", async () => {
    mockUserSearchState = { data: [alice], isFetching: false };
    setup(PresenterField);
    await userEvent.type(screen.getByLabelText("Presenter"), "al");
    expect(await screen.findByRole("listbox")).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument());
  });

  it("should show a spinner while users are being searched", () => {
    mockUserSearchState = { data: [], isFetching: true };
    setup(PresenterField);

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("should display the validation message", async () => {
    setup(PresenterField, "presenter_ids");

    expect(await screen.findByText("Something is wrong")).toBeInTheDocument();
  });
});

describe("PlaylistsField", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should list the playlists when opened and keep the list open while selecting several", async () => {
    const { submit } = setup(PlaylistsField);

    await userEvent.click(screen.getByLabelText("Playlists"));
    await userEvent.click(await screen.findByRole("option", { name: "Frontend" }));
    await userEvent.click(screen.getByRole("option", { name: "Backend" }));

    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect((await submit()).playlists).toEqual([10, 11]);
  });

  it("should close the dropdown when the form scrolls", async () => {
    setup(PlaylistsField);
    await userEvent.click(screen.getByLabelText("Playlists"));
    expect(await screen.findByRole("listbox")).toBeInTheDocument();

    fireEvent.scroll(screen.getByTestId("scroll-container"));

    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument());
  });

  it("should close the dropdown on escape", async () => {
    setup(PlaylistsField);
    await userEvent.click(screen.getByLabelText("Playlists"));
    expect(await screen.findByRole("listbox")).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument());
  });

  it("should display the validation message", async () => {
    setup(PlaylistsField, "playlists");

    expect(await screen.findByText("Something is wrong")).toBeInTheDocument();
  });
});

describe("TagsField", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should offer existing tags with a hash prefix and keep the list open while selecting", async () => {
    const { submit } = setup(TagsField);

    await userEvent.click(screen.getByLabelText("Tags"));
    await userEvent.click(await screen.findByText("#react"));
    await userEvent.click(screen.getByText("#testing", { selector: "li" }));

    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect((await submit()).tags).toEqual([
      { id: 1, name: "react" },
      { id: 2, name: "testing" },
    ]);
  });

  it("should show an existing tag as a hashed chip", async () => {
    setup(TagsField);

    await userEvent.click(screen.getByLabelText("Tags"));
    await userEvent.click(await screen.findByText("#react"));

    expect(screen.getByText("#react", { selector: ".MuiChip-label" })).toBeInTheDocument();
  });

  it("should accept a new free-text tag and strip leading hashes from its chip", async () => {
    const { submit } = setup(TagsField);

    await userEvent.type(screen.getByLabelText("Tags"), "##brand-new{Enter}");

    expect(screen.getByText("#brand-new", { selector: ".MuiChip-label" })).toBeInTheDocument();
    expect((await submit()).tags).toEqual(["##brand-new"]);
  });

  it("should close the dropdown when the form scrolls", async () => {
    setup(TagsField);
    await userEvent.click(screen.getByLabelText("Tags"));
    expect(await screen.findByRole("listbox")).toBeInTheDocument();

    fireEvent.scroll(screen.getByTestId("scroll-container"));

    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument());
  });

  it("should close the dropdown on escape", async () => {
    setup(TagsField);
    await userEvent.click(screen.getByLabelText("Tags"));
    expect(await screen.findByRole("listbox")).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument());
  });

  it("should display the validation message", async () => {
    setup(TagsField, "tags");

    expect(await screen.findByText("Something is wrong")).toBeInTheDocument();
  });
});
