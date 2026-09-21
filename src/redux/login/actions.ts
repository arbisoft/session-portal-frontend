import { createAction } from "@reduxjs/toolkit";

// Leaf module (no store/API imports) so customBaseQuery can dispatch it without an import cycle.
export const logout = createAction("login/logout");
