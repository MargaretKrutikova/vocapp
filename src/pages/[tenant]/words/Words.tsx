import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useQueryClient } from "react-query";
import { mapLanguageValues } from "../../../languages";
import { trpc } from "../../../utils/trpc";
import { useWordForm } from "../../../hooks/useWordForm";
import { WordForm } from "../../../components/WordForm";
import { TextField } from "../../../components/TextField";
import { VocItem, VocValue } from "@prisma/client";
import WordsList from "./WordsList";

export default function Words() {
  const router = useRouter();
  const tenant = router.query.tenant as string;

  const queryClient = useQueryClient();
  const queryName = "vocabulary.getForTenant";

  const {
    data: words,
    error: errorLoadingWords,
    isLoading: isLoadingWords,
    isRefetching: isRefetchingWords,
  } = trpc.useQuery([queryName, { tenant }]);
  const { mutate: performAddWordMutation, isLoading: isAddingWord } =
    trpc.useMutation(["vocabulary.add"], {
      onSuccess: () => {
        queryClient.invalidateQueries([queryName]);
      },
    });

  const [wordState, dispatch] = useWordForm();

  const canAddWord =
    !(isLoadingWords || isAddingWord || isRefetchingWords) &&
    wordState.word.length > 0;

  const addWord = () => {
    if (canAddWord) {
      performAddWordMutation({
        tenant,
        value: wordState.word,
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
        <Link href={`/${tenant}/flash`}>
          <a className="border-black border-2">Flash</a>
        </Link>
      </h6>

      <div>
        <WordForm
          dispatch={dispatch}
          state={wordState}
          canSaveWord={canAddWord}
          onSave={addWord}
        />
        {isRefetchingWords || isAddingWord ? <div>Spinner</div> : null}
        {words ? <WordsList words={[...words].reverse()} /> : null}
      </div>
    </div>
  );
}
