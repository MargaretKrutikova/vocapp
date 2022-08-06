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
      const tenantWhereClause: Prisma.VocValueWhereInput = {
        tenant: input.tenant,
      };

      const rawResult = await ctx.prisma.vocValue.aggregateRaw({
        pipeline: [
          { $match: tenantWhereClause as Prisma.InputJsonValue },
          { $match: { value: { $nin: input.previousWords } } },
          { $sample: { size: 1 } },
        ],
      });

      const typedResponse = rawResult as unknown as VocValue[];
      return typedResponse[0];
    },
  });
