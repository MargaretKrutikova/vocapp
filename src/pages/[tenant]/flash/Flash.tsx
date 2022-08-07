import { useRouter } from "next/router";
import { useState } from "react";
import { trpc } from "../../../utils/trpc";

export default function FlashCard() {
  const router = useRouter();
  const tenant = router.query.tenant as string;

  const [isRevealed, setIsRevealed] = useState(false);
  const [previousWords, setPreviousWords] = useState<string[]>([]);

  const {
    data: word,
    error: errorLoadingWord,
    isLoading: isLoadingWord,
    isRefetching: isRefetchingWord,
    refetch,
  } = trpc.useQuery([
    "vocabulary.getRandomForTenant",
    { tenant, previousWords },
  ]);

  const anotherRandomWord = (currentWord: string) => {
    setIsRevealed(false);
    setPreviousWords((prevWords) => [currentWord, ...prevWords].slice(0, 2));
    refetch();
  };

  if (errorLoadingWord) return <div>Error!</div>;

  return (
    <div>
      <h6 className="text-xl md:text-[1rem] leading-normal font-extrabold text-gray-700 flex justify-between">
        Flashcards for {tenant}
      </h6>
      {isLoadingWord || isRefetchingWord || word === undefined ? (
        <div>Spinner...</div>
      ) : (
        <div className="flex flex-col justify-center">
          <button
            onClick={() => setIsRevealed((prevValue) => !prevValue)}
            className="border-2 border-blue-500 w-full h-80"
          >
            <div className="text-6xl">{word.value}</div>
            <div className="flex flex-col">
              {isRevealed
                ? word.translations.map((t) => (
                    <div key={t.value}>{t.value}</div>
                  ))
                : null}
            </div>
          </button>
          <br />
          <button
            onClick={() => anotherRandomWord(word.value)}
            className="border-green-800 border-2 m-4 h-20"
          >
            NEXT
          </button>
        </div>
      )}
    </div>
  );
}
