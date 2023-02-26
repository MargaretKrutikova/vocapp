import { format, formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { trpc } from "../../../../../../utils/trpc";

export default function SrsAttempts() {
  const router = useRouter();
  const id = router.query.id as string;

  const {
    data: reviewAttempts,
    error: errorLoadingAttempts,
    isLoading: isLoadingAttempts,
  } = trpc.useQuery(["vocabulary.getReviewAttempts", { id }]);

  const {
    data: flashCard,
    error: errorLoadingFlashCard,
    isLoading: isLoadingFlashCard,
  } = trpc.useQuery(["vocabulary.getById", { id }]);

  if (errorLoadingFlashCard || errorLoadingAttempts) return <div>Error!</div>;
  if (isLoadingAttempts || isLoadingFlashCard) return <div>Loading...</div>;

  return (
    <div>
      Attempts for &quot;{flashCard?.value}&quot;
      <div>
        {reviewAttempts?.map((reviewAttempt) => {
          return (
            <div key={reviewAttempt.id}>
              Reviewed:{" "}
              {format(reviewAttempt.dateReviewed, "yyyy-MM-dd hh:mm:ss")},
              score: {reviewAttempt.score}
            </div>
          );
        })}
      </div>
    </div>
  );
}
