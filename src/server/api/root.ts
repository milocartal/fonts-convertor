import { fontRouter } from "~/server/api/routers/font";
import { createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  font: fontRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
