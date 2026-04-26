import { sendUnimplemented } from "../response.js";
import type { ApiRoute } from "./types.js";

type ResourceRouteOptions = {
  basePath: string;
  resourceName: string;
  allowDelete?: boolean;
};

function createPayload(resourceName: string, operation: string, extra: Record<string, unknown> = {}) {
  return {
    resource: resourceName,
    operation,
    placeholder: true,
    message: "Backend route skeleton only. Persistence, validation, and auth are not connected yet.",
    ...extra,
  };
}

export function createResourceRoutes({ basePath, resourceName, allowDelete = true }: ResourceRouteOptions): ApiRoute[] {
  const listPattern = new RegExp(`^${basePath}$`);
  const entityPattern = new RegExp(`^${basePath}/(?<id>[^/]+)$`);

  const routes: ApiRoute[] = [
    {
      method: "GET",
      pattern: listPattern,
      description: `List ${resourceName}`,
      handler: (_req, res) => {
        sendUnimplemented(res, `List ${resourceName}`);
      },
    },
    {
      method: "GET",
      pattern: entityPattern,
      description: `Get ${resourceName} by id`,
      handler: (_req, res, context) => {
        sendUnimplemented(res, `Get ${resourceName} by id ${context.params.id}`);
      },
    },
    {
      method: "POST",
      pattern: listPattern,
      description: `Create ${resourceName}`,
      handler: (_req, res, context) => {
        void context;
        sendUnimplemented(res, `Create ${resourceName}`);
      },
    },
    {
      method: "PATCH",
      pattern: entityPattern,
      description: `Update ${resourceName}`,
      handler: (_req, res, context) => {
        sendUnimplemented(res, `Update ${resourceName} ${context.params.id}`);
      },
    },
  ];

  if (allowDelete) {
    routes.push({
      method: "DELETE",
      pattern: entityPattern,
      description: `Delete ${resourceName}`,
      handler: (_req, res, context) => {
        sendUnimplemented(res, `Delete ${resourceName} ${context.params.id}`);
      },
    });
  }

  return routes;
}
