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
  typedLanguageKeys,
} from "../../../languages";
import { trpc } from "../../../utils/trpc";

function Words() {
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

  const canAddWord =
    !(isLoadingWords || isAddingWord || isRefetchingWords) && word.length > 0;

  const addWord = (word: string) => {
    if (canAddWord) {
      performAddWordMutation({
        value: word,
        tenant,
        language,
        translations: typedLanguageKeys(translations)
          .map((language) => ({
            value: translations[language],
            language,
          }))
          .filter((t) => t.value.length > 0),
      });
      setWord("");
      setTranslations(EMPTY_TRANSLATIONS);
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
      <h6 className="text-xl md:text-[1rem] leading-normal font-extrabold text-gray-700">
        Words in {tenant}:
      </h6>

      {isRefetchingWords || isAddingWord ? <div>Spinner</div> : null}

      <div>
        <div className="pt-6 text-2xl text-violet-500 flex-col flex justify-center items-center w-full">
          {words
            ? words.map((w) => (
                <div key={w.id}>
                  {w.value} ({w.tenant})
                </div>
              ))
            : null}
        </div>
        <div>
          <TextField
            placeholder="Word or phrase"
            value={word}
            onTextChange={setWord}
          />
          <LanguageSelector language="es" onLanguageChange={setLanguage} />

          <LanguageInputList
            languageValues={translations}
            onChange={setTranslations}
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

export default Words;
