import { selectCurrentUser, selectIsAuthenticated, selectIsStaff, selectUserRole } from "./selectors";

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

const buildAuthState = (currentUser?: Record<string, unknown> | null) =>
  ({ login: { session: { user_info: null }, currentUser } }) as unknown as Parameters<typeof selectCurrentUser>[0];

describe("current user selectors", () => {
  const user = { id: 1, role: "admin", is_staff: true };

  it("should return the verified user", () => {
    expect(selectCurrentUser(buildAuthState(user))).toEqual(user);
    expect(selectIsAuthenticated(buildAuthState(user))).toBe(true);
    expect(selectUserRole(buildAuthState(user))).toBe("admin");
  });

  it("should treat a missing user as unauthenticated", () => {
    expect(selectCurrentUser(buildAuthState(null))).toBeNull();
    expect(selectIsAuthenticated(buildAuthState(null))).toBe(false);
    expect(selectUserRole(buildAuthState(null))).toBeNull();
  });

  it("should treat state rehydrated without the field as unauthenticated", () => {
    expect(selectCurrentUser(buildAuthState(undefined))).toBeNull();
    expect(selectIsAuthenticated(buildAuthState(undefined))).toBe(false);
  });
});
