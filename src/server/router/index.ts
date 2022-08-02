// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { vocRouter } from "./vocabulary";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("vocabulary.", vocRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
