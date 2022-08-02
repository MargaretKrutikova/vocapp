import { createRouter } from "./context";
import { z } from "zod";

export const vocRouter = createRouter()
  .mutation("add", {
    input: z.object({
      value: z.string(),
    }),
    resolve: async ({ input, ctx }) => {
      await ctx.prisma.$connect();

      const result = await ctx.prisma.vocValue.create({
        data: {
          value: input.value,
          language: "sv",
        },
      });
      return { id: result.id };
    },
  })
  .query("getAll", {
    resolve: async ({ ctx }) => {
      await ctx.prisma.$connect();
      return await ctx.prisma.vocValue.findMany();
    },
  });
