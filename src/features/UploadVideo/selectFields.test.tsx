import { Control, useForm, useWatch } from "react-hook-form";

import { customRender as render, fireEvent, screen, within } from "@/jest/utils/testUtils";

import { FormValues } from "./fields";
import { PlaylistsField, PresenterField, TagsField } from "./selectFields";

const mockSearchUsers = jest.fn();
let mockUsers: { id: number; first_name: string; last_name: string; full_name: string; email: string }[] = [];
let mockSearching = false;

jest.mock("@/redux/events/apiSlice", () => ({
  useAllTagsQuery: () => ({ data: [{ id: 1, name: "React" }] }),
  usePlaylistsQuery: () => ({ data: [{ id: 10, name: "Onboarding" }] }),
  useLazySearchUsersQuery: () => [mockSearchUsers, { data: mockUsers, isFetching: mockSearching }],
}));

const Values = ({ control }: { control: Control<FormValues> }) => {
  const presenters = useWatch({ control, name: "presenter_ids" });
  const playlists = useWatch({ control, name: "playlists" });
  const tags = useWatch({ control, name: "tags" });
  return <output data-testid="values">{JSON.stringify({ presenters, playlists, tags })}</output>;
};

const Harness = () => {
  const { control } = useForm<FormValues>({
    defaultValues: { title: "", description: "", presenter_ids: [], playlists: [], tags: [] },
  });
  return (
    <>
      <PresenterField control={control} />
      <PlaylistsField control={control} />
      <TagsField control={control} />
      <Values control={control} />
    </>
  );
};

// Focus first, as a real user does; MUI resets the input text of an unfocused autocomplete.
const typeInto = (input: HTMLElement, text: string) => {
  fireEvent.focus(input);
  fireEvent.change(input, { target: { value: text } });
};

const values = () => JSON.parse(screen.getByTestId("values").textContent as string);
const user = (id: number, name: string, email: string) => ({
  id,
  first_name: name.split(" ")[0],
  last_name: name.split(" ")[1] ?? "",
  full_name: name,
  email,
});

describe("PresenterField", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsers = [user(1, "Ada Lovelace", "ada@arbisoft.com"), user(2, "Ada Lovelace", "ada.l@arbisoft.com")];
    mockSearching = false;
  });

  it("should tell the user how many characters are needed and not search before that", () => {
    render(<Harness />);
    const input = screen.getByLabelText(/^Presenters/);

    expect(screen.getByText("Type at least 2 characters to search")).toBeInTheDocument();
    fireEvent.change(input, { target: { value: "a" } });

    expect(mockSearchUsers).not.toHaveBeenCalled();
  });

  it("should search from two characters and show matches with their email", () => {
    render(<Harness />);

    typeInto(screen.getByLabelText(/^Presenters/), "ad");

    expect(mockSearchUsers).toHaveBeenCalledWith("ad");
    expect(screen.getAllByRole("option")).toHaveLength(2);
    expect(screen.getByText(/ada@arbisoft\.com/)).toBeInTheDocument();
  });

  it("should say when nobody matches", () => {
    mockUsers = [];
    render(<Harness />);

    typeInto(screen.getByLabelText(/^Presenters/), "zz");

    expect(screen.getByText("No people found")).toBeInTheDocument();
  });

  it("should show a loading hint and spinner while searching", () => {
    mockUsers = [];
    mockSearching = true;
    render(<Harness />);

    typeInto(screen.getByLabelText(/^Presenters/), "ad");

    expect(screen.getByText("Searching…")).toBeInTheDocument();
  });

  it("should add the chosen people to the form and tell same-named people apart by email", () => {
    render(<Harness />);
    const input = screen.getByLabelText(/^Presenters/);

    fireEvent.change(input, { target: { value: "ad" } });
    fireEvent.click(screen.getAllByRole("option")[0]);
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "ad" } });
    fireEvent.click(screen.getAllByRole("option")[1]);

    expect(values().presenters).toEqual([1, 2]);
    expect(screen.getByText("Ada Lovelace (ada@arbisoft.com)")).toBeInTheDocument();
    expect(screen.getByText("Ada Lovelace (ada.l@arbisoft.com)")).toBeInTheDocument();
  });

  it("should fall back to first and last name when there is no full name", () => {
    mockUsers = [{ ...user(3, "Grace Hopper", "grace@arbisoft.com"), full_name: "" }];
    render(<Harness />);

    typeInto(screen.getByLabelText(/^Presenters/), "gr");

    expect(screen.getByRole("option")).toHaveTextContent("Grace Hopper — grace@arbisoft.com");
  });
});

describe("PlaylistsField", () => {
  it("should add a chosen playlist to the form", () => {
    render(<Harness />);

    fireEvent.keyDown(screen.getByLabelText(/^Playlists/), { key: "ArrowDown" });
    fireEvent.click(screen.getByRole("option", { name: /Onboarding/ }));

    expect(values().playlists).toEqual([10]);
  });
});

const chipLabels = () => Array.from(document.querySelectorAll(".MuiChip-label")).map((el) => el.textContent);

describe("TagsField", () => {
  const addTag = (text: string) => {
    const input = screen.getByLabelText(/^Tags/);
    fireEvent.change(input, { target: { value: text } });
    fireEvent.keyDown(input, { key: "Enter" });
  };

  it("should explain how to create a tag", () => {
    render(<Harness />);

    expect(screen.getByText("Press Enter to create a new tag")).toBeInTheDocument();
  });

  it("should create a new tag without the leading hash", () => {
    render(<Harness />);

    addTag("#brand-new");

    expect(values().tags).toEqual(["brand-new"]);
    expect(chipLabels()).toEqual(["#brand-new"]);
  });

  it("should reuse an existing tag typed in another case instead of creating a duplicate", () => {
    render(<Harness />);

    addTag("react");

    expect(values().tags).toEqual([{ id: 1, name: "React" }]);
    expect(chipLabels()).toEqual(["#React"]);
  });

  it("should ignore a tag that is only a hash and duplicates of one already added", () => {
    render(<Harness />);

    addTag("#");
    addTag("fresh");
    addTag("FRESH");

    expect(values().tags).toEqual(["fresh"]);
  });

  it("should pick an existing tag from the list and allow removing it", () => {
    render(<Harness />);

    fireEvent.keyDown(screen.getByLabelText(/^Tags/), { key: "ArrowDown" });
    fireEvent.click(screen.getByRole("option", { name: /React/ }));
    expect(values().tags).toEqual([{ id: 1, name: "React" }]);

    fireEvent.click(within(document.querySelector(".MuiChip-root") as HTMLElement).getByTestId("CancelIcon"));

    expect(values().tags).toEqual([]);
  });
});
