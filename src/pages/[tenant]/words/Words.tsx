import { VocItem } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { useQueryClient } from "react-query";
import { LanguageInputList } from "../../../components/LanguageInputList";
import { LanguageSelector } from "../../../components/LanguageSelector";
import { TextField } from "../../../components/TextField";
import {
  EMPTY_TRANSLATIONS,
  Language,
  LanguageValues,
} from "../../../languages";
import { trpc } from "../../../utils/trpc";

const mapLanguageValues = (values: LanguageValues): VocItem[] =>
  [...values.entries()]
    .map(([language, value]) => ({
      value,
      language,
    }))
    .filter((t) => t.value.length > 0);

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

  const [word, setWord] = React.useState("");
  const [language, setLanguage] = React.useState<Language>("es");

  const [translations, setTranslations] =
    React.useState<LanguageValues>(EMPTY_TRANSLATIONS);

  const [explanations, setExplanations] =
    React.useState<LanguageValues>(EMPTY_TRANSLATIONS);

  const [usages, setUsages] =
    React.useState<LanguageValues>(EMPTY_TRANSLATIONS);

  const canAddWord =
    !(isLoadingWords || isAddingWord || isRefetchingWords) && word.length > 0;

  const addWord = (word: string) => {
    if (canAddWord) {
      performAddWordMutation({
        value: word,
        tenant,
        language,
        translations: mapLanguageValues(translations),
        explanations: mapLanguageValues(explanations),
        usages: mapLanguageValues(usages),
      });
      setWord("");
      setTranslations(EMPTY_TRANSLATIONS);
      setExplanations(EMPTY_TRANSLATIONS);
      setUsages(EMPTY_TRANSLATIONS);
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
        <div className="pt-6 text-2xl text-violet-500 flex-col flex w-full ml-4 mb-6">
          {words
            ? words.map((w) => (
                <div key={w.id}>
                  {w.value}
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
        <div>
          <div className="flex">
            <TextField
              autoFocus={true}
              tabIndex={0}
              placeholder="Word or phrase"
              value={word}
              onTextChange={setWord}
            />
            <LanguageSelector language="es" onLanguageChange={setLanguage} />
          </div>

          <LanguageInputList
            languageValues={translations}
            onChange={setTranslations}
            type="input"
          />
          <LanguageInputList
            languageValues={explanations}
            onChange={setExplanations}
            title="Explanations"
          />
          <LanguageInputList
            languageValues={usages}
            onChange={setUsages}
            title="Usages"
          />

          <button
            className={`${
              !canAddWord ? "bg-gray-300" : "bg-violet-500 hover:bg-violet-700"
            } text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline`}
            disabled={!canAddWord}
            onClick={() => addWord(word)}
          >
            Add word
          </button>
        </div>
      </div>
    </div>
  );
}
