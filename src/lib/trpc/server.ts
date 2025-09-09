import { headers } from "next/headers";

import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/context";

export const api = appRouter.createCaller(
  await createTRPCContext({
    headers: headers(),
  }),
);
