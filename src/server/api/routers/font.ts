/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { z } from "zod";
import axios from "axios";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { FontList } from "~/utils/type";

export const fontRouter = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    const temp = await fetch(`https://fonts.google.com/metadata/fonts`, {
      method: "GET",
      headers: { accept: "application/json" },
    });

    if (!temp.ok) {
      throw new Error(`API request failed with status ${temp.status}`);
    }

    const fonts: FontList = await temp.json();
    return fonts;
  }),

  getOne: publicProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const temps = await axios.get(
          "https://fonts.google.com/download/list?family=Roboto",
          {
            headers: { accept: "application/json" },
          },
        );
        const fonts: string = temps.data;
        const obj = JSON.parse(fonts.slice(5));
        return obj;
      } catch (error) {
        console.log(error);
      }
    }),
});
