import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { useQueryClient } from "react-query";
import { mapLanguageValues } from "../../../languages";
import { trpc } from "../../../utils/trpc";
import { useWordForm } from "../../../hooks/useWordForm";
import { WordForm } from "../../../components/WordForm";
import WordsList from "../../../components/WordsList";
import { VocValue } from "@prisma/client";
import { ReactQueryDevtools } from "react-query/devtools";

export default function Words() {
  const router = useRouter();
  const tenant = router.query.tenant as string;

  const queryClient = useQueryClient();
  const queryName = "vocabulary.getForTenant";
  const queryKey = [queryName, { tenant }];

  const {
    data: words,
    error: errorLoadingWords,
    isLoading: isLoadingWords,
  } = trpc.useQuery([queryName, { tenant }]);
  const { mutate: performAddWordMutation, isLoading: isAddingWord } =
    trpc.useMutation(["vocabulary.add"], {
      onMutate: async (newWord) => {
        await queryClient.cancelQueries(queryKey);
        const previousWords = queryClient.getQueryData<VocValue[]>(queryKey);

        const tempId = Math.random().toString();
        queryClient.setQueryData<VocValue[]>(queryKey, (oldWords) => [
          ...(oldWords ?? []),
          { ...newWord, id: tempId, dateAdded: new Date(), dateUpdated: null },
        ]);

        return { id: tempId, previousWords };
      },
      onError: (_err, _newWord, context) => {
        if (context?.previousWords) {
          queryClient.setQueryData<VocValue[]>(queryKey, context.previousWords);
        }
      },
      onSettled: (data, error, _, context) => {
        if (error) {
          console.log("Error adding word", error.message);
          queryClient.invalidateQueries(queryKey);
        }

        if (context?.id === undefined || data?.id === undefined) return;

        queryClient.setQueryData<VocValue[]>(
          queryKey,
          (oldWords) =>
            oldWords?.map((oldWord) =>
              oldWord.id === context.id ? { ...oldWord, id: data.id } : oldWord
            ) ?? []
        );
      },
    });

  const [wordState, dispatch] = useWordForm();

  const canAddWord =
    !(isLoadingWords || isAddingWord) && wordState.word.length > 0;

  const addWord = () => {
    if (canAddWord) {
      performAddWordMutation({
        tenant,
        value: wordState.word,
        imageUrl: wordState.imageUrl,
        language: wordState.language,
        translations: mapLanguageValues(wordState.translations),
        explanations: mapLanguageValues(wordState.explanations),
        usages: mapLanguageValues(wordState.usages),
      });

      dispatch({ type: "ClearForm" });
    }
  };

  if (isLoadingWords) return <div>Loading words in {tenant}...</div>;
  if (errorLoadingWords)
    return (
      <div className="text-xl text-red-700">
        Failed to load words in {tenant}...
      </div>
    );

  return (
    <div>
      <h6 className="text-xl md:text-[1rem] leading-normal font-extrabold text-gray-700 flex justify-between">
        Words in {tenant}.
        <Link href={`/${tenant}/srs/kya`}>
          <a className="border-black border-2">SRS</a>
        </Link>
        <Link href={`/${tenant}/flash`}>
          <a className="border-black border-2">Flash</a>
        </Link>
      </h6>

      {process.env.NODE_ENV !== "production" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}

      <div>
        <WordForm
          dispatch={dispatch}
          state={wordState}
          canSaveWord={canAddWord}
          onSave={addWord}
        />
        {isAddingWord ? <div>Spinner</div> : null}
        {words ? (
          <WordsList words={[...words].reverse()} isDisabled={isAddingWord} />
        ) : null}
      </div>
    </div>
  );
}
