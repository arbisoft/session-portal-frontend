import { sendGTMEvent } from "@next/third-parties/google";
import { useForm } from "react-hook-form";

import { customRender as render, fireEvent, screen } from "@/jest/utils/testUtils";
import { ANALYTICS_CATEGORY, GA_EVENTS } from "@/utils/analytics";

import { FormValues } from "./fields";
import LeaveGuardDialog from "./leaveGuardDialog";

jest.mock("@next/third-parties/google", () => ({ sendGTMEvent: jest.fn() }));

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ push: mockPush }) }));

const Harness = ({ hasFile }: { hasFile: boolean }) => {
  const { control } = useForm<FormValues>({ defaultValues: { title: "" } });
  return (
    <>
      <a href="/videos">Browse videos</a>
      <LeaveGuardDialog control={control} hasFile={hasFile} />
    </>
  );
};

const leaveEvent = (action: string) => ({
  event: GA_EVENTS.UPLOAD_LEAVE_GUARD,
  event_category: ANALYTICS_CATEGORY.UPLOAD_VIDEO,
  action,
  has_video: true,
  has_unsaved_details: false,
});

describe("LeaveGuardDialog", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should not ask or track anything when there is nothing to lose", () => {
    render(<Harness hasFile={false} />);

    fireEvent.click(screen.getByRole("link", { name: "Browse videos" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(sendGTMEvent).not.toHaveBeenCalled();
  });

  it("should track the prompt once and the decision to stay", () => {
    render(<Harness hasFile />);

    fireEvent.click(screen.getByRole("link", { name: "Browse videos" }));
    expect(screen.getByRole("dialog", { name: "Leave this page?" })).toBeInTheDocument();
    expect(sendGTMEvent).toHaveBeenCalledTimes(1);
    expect(sendGTMEvent).toHaveBeenCalledWith(leaveEvent("shown"));

    fireEvent.click(screen.getByRole("button", { name: "Stay" }));

    expect(sendGTMEvent).toHaveBeenCalledWith(leaveEvent("stay"));
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("should track the decision to leave and navigate", () => {
    render(<Harness hasFile />);

    fireEvent.click(screen.getByRole("link", { name: "Browse videos" }));
    fireEvent.click(screen.getByRole("button", { name: "Leave page" }));

    expect(sendGTMEvent).toHaveBeenCalledWith(leaveEvent("leave"));
    expect(mockPush).toHaveBeenCalledWith("/videos");
  });
});
