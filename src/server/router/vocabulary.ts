import { createRouter } from "./context";
import { z } from "zod";

export const vocRouter = createRouter()
  .mutation("add", {
    input: z.object({
      tenant: z.string(),
      value: z.string(),
      translations: z.array(
        z.object({ value: z.string(), language: z.string() })
      ),
      language: z.string(),
    }),
    resolve: async ({
      input: { value, tenant, language, translations },
      ctx,
    }) => {
      await ctx.prisma.$connect();

      const result = await ctx.prisma.vocValue.create({
        data: {
          value,
          tenant,
          language,
          translations,
          dateAdded: new Date(),
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
  })
  .query("getForTenant", {
    input: z.object({
      tenant: z.string(),
    }),
    resolve: async ({ ctx, input }) => {
      await ctx.prisma.$connect();
      return await ctx.prisma.vocValue.findMany({
        where: { tenant: input.tenant },
      });
    },
  });
