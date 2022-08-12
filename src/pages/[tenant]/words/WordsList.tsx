import { VocItem, VocValue } from "@prisma/client";
import { useState } from "react";
import { useRouter } from "next/router";
import { TextField } from "../../../components/TextField";

type Props = {
  words: VocValue[];
};

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

export default function WordsList({ words }: Props) {
  const router = useRouter();
  const tenant = router.query.tenant as string;
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      <div className="flex m-2 p-2 border-2">
        Search:
        <TextField value={searchQuery} onTextChange={setSearchQuery} />
      </div>

      <div className="pt-6 text-2xl text-violet-500 flex-col flex w-full ml-4 mb-6">
        {filterWords(words, searchQuery).map((w) => (
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
        ))}
      </div>
    </>
  );
}
