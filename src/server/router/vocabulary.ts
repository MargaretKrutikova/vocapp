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
      explanations: z.array(
        z.object({ value: z.string(), language: z.string() })
      ),
      usages: z.array(z.object({ value: z.string(), language: z.string() })),
      language: z.string(),
    }),
    resolve: async ({
      input: { value, tenant, language, translations, explanations, usages },
      ctx,
    }) => {
      const result = await ctx.prisma.vocValue.create({
        data: {
          value,
          tenant,
          language,
          translations,
          explanations,
          usages,
          dateAdded: new Date(),
        },
      });
      return { id: result.id };
    },
  })
  .mutation("edit", {
    input: z.object({
      id: z.string(),
      value: z.string(),
      translations: z.array(
        z.object({ value: z.string(), language: z.string() })
      ),
      explanations: z.array(
        z.object({ value: z.string(), language: z.string() })
      ),
      usages: z.array(z.object({ value: z.string(), language: z.string() })),
      language: z.string(),
    }),
    resolve: async ({
      input: { id, value, language, translations, explanations, usages },
      ctx,
    }) => {
      const result = await ctx.prisma.vocValue.update({
        data: {
          value,
          language,
          translations,
          explanations,
          usages,
          dateUpdated: new Date(),
        },
        where: { id },
      });
      return { id: result.id };
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
  .query("getById", {
    input: z.object({
      id: z.string(),
    }),
    resolve: async ({ ctx, input }) => {
      return await ctx.prisma.vocValue.findUnique({
        where: { id: input.id },
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
