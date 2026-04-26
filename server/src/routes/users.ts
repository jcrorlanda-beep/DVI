import { createResourceRoutes } from "./resourceRoute.js";

export const userRoutes = createResourceRoutes({
  basePath: "/api/users",
  resourceName: "users",
  allowDelete: false,
});
