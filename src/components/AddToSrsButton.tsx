import formatDistanceToNow from "date-fns/formatDistanceToNow";
import { useState } from "react";
import { trpc } from "../utils/trpc";

type Props = {
  id: string;
  account: string;
  tenant: string;
};

export function AddToSrsButton({ id, account, tenant }: Props) {
  const [flashCardInfo, setFlashCardInfo] = useState<string | null>();
  const [errorAddingToSrs, setErrorAddingToSrs] = useState<string | null>();

  const { mutateAsync: addToSrsMutation, isLoading: isSavingFlashCard } =
    trpc.useMutation("vocabulary.addToSrs");

  return (
    <>
      {errorAddingToSrs ? (
        <span className="text-xs">
          {errorAddingToSrs}. Please try again later.
        </span>
      ) : null}
      {flashCardInfo ? (
        <span className="text-xs">{flashCardInfo}</span>
      ) : (
        <button
          className="text-xs border-2 border-gray "
          onClick={() => {
            addToSrsMutation({ id, account, tenant })
              .then((flashCard) => {
                setFlashCardInfo(
                  `Next review date: ${formatDistanceToNow(
                    flashCard.nextReviewDate,
                    { addSuffix: true }
                  )}`
                );
              })
              .catch((e) =>
                setErrorAddingToSrs(
                  `Error adding card with id: ${id} to SRS: ${e}`
                )
              );
          }}
        >
          Add to SRS
        </button>
      )}
    </>
  );
}
