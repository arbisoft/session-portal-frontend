import { selectIsStaff } from "./selectors";

const buildState = (userInfo: Record<string, unknown> | null) =>
  ({ login: { session: { user_info: userInfo } } }) as unknown as Parameters<typeof selectIsStaff>[0];

describe("selectIsStaff", () => {
  it("should return true for a staff user", () => {
    expect(selectIsStaff(buildState({ is_staff: true }))).toBe(true);
  });

  it("should return false for a non-staff user", () => {
    expect(selectIsStaff(buildState({ is_staff: false }))).toBe(false);
  });

  it("should return false when user info is missing", () => {
    expect(selectIsStaff(buildState(null))).toBe(false);
  });
});
