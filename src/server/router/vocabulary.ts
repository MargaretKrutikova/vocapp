import { createRouter } from "./context";
import { z } from "zod";
import { FlashCard, VocValue } from "@prisma/client";
import { initialCardState } from "../../pages/[tenant]/srs/[account]/srsAlgorithm";
import addMinutes from "date-fns/addMinutes";

export type FlashCardWithValue = Pick<
  FlashCard,
  "vocValueId" | "nextReviewDate"
> & {
  vocValue: VocValue;
};

export const vocRouter = createRouter()
  .mutation("add", {
    input: z.object({
      tenant: z.string(),
      value: z.string(),
      imageUrl: z.string(),
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
      input: {
        value,
        imageUrl,
        tenant,
        language,
        translations,
        explanations,
        usages,
      },
      ctx,
    }) => {
      const result: VocValue = await ctx.prisma.vocValue.create({
        data: {
          value,
          imageUrl,
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
      imageUrl: z.string(),
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
      input: {
        id,
        value,
        imageUrl,
        language,
        translations,
        explanations,
        usages,
      },
      ctx,
    }) => {
      const result = await ctx.prisma.vocValue.update({
        data: {
          value,
          imageUrl,
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
  .query("getFlashCardsToReview", {
    input: z.object({
      tenant: z.string(),
      account: z.string(),
    }),
    resolve: async ({ ctx, input }) => {
      const flashCardsToReview: Array<FlashCardWithValue> =
        await ctx.prisma.flashCard.findMany({
          where: {
            tenant: input.tenant,
            account: input.account,
            nextReviewDate: { lte: new Date() },
          },
          orderBy: { nextReviewDate: "asc" },
          select: { vocValueId: true, vocValue: true, nextReviewDate: true },
        });

      return flashCardsToReview;
    },
  })
  .mutation("addToSrs", {
    input: z.object({
      id: z.string(),
      tenant: z.string(),
      account: z.string(),
    }),
    resolve: async ({
      ctx,
      input,
    }): Promise<Pick<FlashCard, "nextReviewDate">> => {
      const existingFlashCard = await ctx.prisma.flashCard.findUnique({
        where: { vocValueId: input.id },
        select: { nextReviewDate: true },
      });

      if (existingFlashCard !== null) {
        return { nextReviewDate: existingFlashCard.nextReviewDate };
      }

      const result: FlashCard = await ctx.prisma.flashCard.create({
        data: {
          vocValueId: input.id,
          account: input.account,
          bucket: initialCardState.bucket,
          eFactor: initialCardState.efactor,
          interval: initialCardState.interval,
          tenant: input.tenant,
          isActive: true,
          nextReviewDate: addMinutes(new Date(), 1),
        },
      });

      return { nextReviewDate: result.nextReviewDate };
    },
  });
