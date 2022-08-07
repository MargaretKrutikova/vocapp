import { createRouter } from "./context";
import { z } from "zod";
import { Prisma, VocValue } from "@prisma/client";

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
      return await ctx.prisma.vocValue.findMany();
    },
  })
  .query("getForTenant", {
    input: z.object({
      tenant: z.string(),
    }),
    resolve: async ({ ctx, input }) => {
      return await ctx.prisma.vocValue.findMany({
        where: { tenant: input.tenant },
      });
    },
  })
  .query("getRandomForTenant", {
    input: z.object({
      tenant: z.string(),
      previousWords: z.array(z.string()),
    }),
    resolve: async ({ ctx, input }) => {
      const tenantFilter: Prisma.VocValueWhereInput = {
        tenant: input.tenant,
        value: { notIn: input.previousWords },
      };

      const totalCount = await ctx.prisma.vocValue.count({
        where: tenantFilter,
      });

      const result: VocValue[] = await ctx.prisma.vocValue.findMany({
        where: tenantFilter,
        skip: Math.floor(totalCount * Math.random()),
        take: 1,
      });

      return result[0];
    },
  });
