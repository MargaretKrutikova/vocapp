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
    setPreviousWords((prev) => [currentWord, ...prev].slice(0, 2));
    refetch();
  };

  if (errorLoadingWord) return <div>Error!</div>;

  return (
    <div>
      <h6>Flashcard for {tenant}</h6>
      {isLoadingWord || isRefetchingWord || word === undefined ? (
        <div>Spinner...</div>
      ) : (
        <div>
          <button onClick={() => setIsRevealed((prev) => !prev)}>
            {word.value}
          </button>
          {isRevealed ? <div>{word.translations[0]?.value}</div> : null}
          <br />
          <button onClick={() => anotherRandomWord(word.value)}>NEXT</button>
        </div>
      )}
    </div>
  );
}
