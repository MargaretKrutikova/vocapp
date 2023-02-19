import { createRouter } from "./context";
import { z } from "zod";
import { FlashCard, VocValue } from "@prisma/client";
import {
  CardState,
  EvaluationScore,
  initialCardState,
  srsFunc,
} from "../../srsLogic/srsAlgorithm";
import addMinutes from "date-fns/addMinutes";
import { getLateness, minutesFromDays } from "../../srsLogic/dateLogic";

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
          eFactor: initialCardState.eFactor,
          interval: initialCardState.interval,
          tenant: input.tenant,
          isActive: true,
          nextReviewDate: addMinutes(new Date(), 1),
        },
      });

      return { nextReviewDate: result.nextReviewDate };
    },
  })
  .mutation("updateFlashCard", {
    input: z.object({
      id: z.string(),
      tenant: z.string(),
      account: z.string(),
      score: z.coerce.number().min(1).max(5),
    }),
    resolve: async ({
      ctx,
      input,
    }): Promise<Pick<FlashCard, "nextReviewDate">> => {
      const previousState: CardState & Pick<FlashCard, "nextReviewDate"> =
        await ctx.prisma.flashCard.findUniqueOrThrow({
          where: { vocValueId: input.id },
          select: {
            bucket: true,
            eFactor: true,
            interval: true,
            nextReviewDate: true,
          },
        });

      const now = new Date();
      const lateness = getLateness(
        previousState.nextReviewDate,
        previousState.interval,
        now
      );

      const newState = srsFunc(Math.random, previousState, {
        score: input.score as EvaluationScore, // TODO: Consider type guards
        lateness,
      });

      const nextReviewDate = addMinutes(
        now,
        minutesFromDays(newState.interval)
      );

      const updatedFlashCardDate = await ctx.prisma.flashCard.update({
        where: { vocValueId: input.id },
        data: {
          bucket: newState.bucket,
          eFactor: newState.eFactor,
          interval: newState.interval,
          nextReviewDate,
        },
        select: {
          nextReviewDate: true,
        },
      });

      await ctx.prisma.reviewAttempt.create({
        data: {
          flashCardId: input.id,
          dateReviewed: now,
          lateness,
          score: input.score,
        },
      });

      return { nextReviewDate: updatedFlashCardDate.nextReviewDate };
    },
  });
