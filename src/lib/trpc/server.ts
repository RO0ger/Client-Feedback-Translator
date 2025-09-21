import "server-only";

import { headers } from "next/headers";
import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/context";

/**
 * This is the server-side tRPC caller. It is a factory function that creates a new caller for each request.
 * This ensures that the `headers` function is called within a valid request scope.
 */
export const createApiCaller = async () => {
  const resolvedHeaders = await headers();
  const context = await createTRPCContext({
    headers: resolvedHeaders,
  });
  return appRouter.createCaller(context);
};
