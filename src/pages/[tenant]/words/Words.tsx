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

const transformText = (text: string) =>
  text
    .trim()
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

const searchIsInVocItems = (vocItems: VocItem[], searchQuery: string) =>
  vocItems.some((item) => transformText(item.value).includes(searchQuery));

const filterWords = (wordsToFilter: VocValue[], searchQuery: string) => {
  const query = searchQuery ? searchQuery.trim().toLocaleLowerCase() : "";

  if (wordsToFilter && query) {
    return wordsToFilter.filter(
      (w) =>
        transformText(w.value).includes(query) ||
        searchIsInVocItems(w.translations, query) ||
        searchIsInVocItems(w.explanations, query) ||
        searchIsInVocItems(w.usages, query)
    );
  }
  return wordsToFilter;
};

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
  const [searchQuery, setSearchQuery] = useState("");

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

      {isRefetchingWords || isAddingWord ? <div>Spinner</div> : null}

      <div>
        <TextField value={searchQuery} onTextChange={setSearchQuery} />
        <div className="pt-6 text-2xl text-violet-500 flex-col flex w-full ml-4 mb-6">
          {words
            ? filterWords(words, searchQuery).map((w) => (
                <div key={w.id}>
                  <div className="flex">
                    {w.value}
                    <button
                      className="px-4"
                      onClick={() => {
                        router.push(`/${tenant}/${w.id}`);
                      }}
                    >
                      ✎
                    </button>
                  </div>
                  <div className="text-lg">
                    {w.translations.map((t) => (
                      <div key={t.language}>
                        {t.language}: {t.value}
                      </div>
                    ))}
                  </div>
                  <div className="text-sm">
                    {w.explanations.map((t) => (
                      <div key={t.language}>
                        {t.language}: {t.value}
                      </div>
                    ))}
                  </div>
                  <div className="text-sm">
                    {w.usages.map((t) => (
                      <div key={t.language}>
                        {t.language}: {t.value}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            : null}
        </div>
        <WordForm
          dispatch={dispatch}
          state={wordState}
          canSaveWord={canAddWord}
          onSave={addWord}
        />
      </div>
    </div>
  );
}