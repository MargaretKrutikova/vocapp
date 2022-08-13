import { VocValue } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { trpc } from "../../../utils/trpc";

export default function FlashCard() {
  const router = useRouter();
  const tenant = router.query.tenant as string;

  const [isInFlippedMode, setIsInFlippedMode] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [previousWords, setPreviousWords] = useState<VocValue[]>([]);
  const [currentWord, setCurrentWord] = useState<VocValue | null>(null);

  const {
    data: words,
    error: errorLoadingWords,
    isLoading: isLoadingWords,
  } = trpc.useQuery(["vocabulary.getForTenant", { tenant }]);

  const anotherRandomWord = (currentWord: VocValue) => {
    setIsRevealed(false);
    setPreviousWords((prevWords) => [currentWord, ...prevWords]);
  };

  useEffect(() => {
    if (words !== undefined) {
      const randomVal = Math.floor(
        (words.length - previousWords.length) * Math.random()
      );
      const newWord = words.filter((w) => !previousWords.includes(w))[
        randomVal
      ];
      if (newWord === undefined) {
        setPreviousWords([]);
        setCurrentWord(null);
      } else {
        setCurrentWord(newWord);
      }
    }
  }, [words, previousWords]);

  if (errorLoadingWords) return <div>Error!</div>;

  const translationsList = currentWord?.translations.map((t) => (
    <div key={t.value}>{t.value}</div>
  ));

  const mainCardContents = isInFlippedMode
    ? translationsList
    : currentWord?.value;
  const revealedContents = isInFlippedMode
    ? currentWord?.value
    : translationsList;

  return (
    <div>
      <h6 className="text-xl md:text-[1rem] leading-normal font-extrabold text-gray-700 flex justify-between">
        <span>
          Flashcards for{" "}
          <Link href={`/${tenant}/words`}>
            <a className="underline text-blue-800">{tenant}</a>
          </Link>
          . Total: {words?.length}. Covered: {previousWords.length}
        </span>
        <button
          className="border-black border-2"
          onClick={() => setIsInFlippedMode((prevValue) => !prevValue)}
        >
          {isInFlippedMode ? "Flipped" : "Normal"}
        </button>
      </h6>
      {isLoadingWords || currentWord === null ? (
        <div>Spinner...</div>
      ) : (
        <div className="flex flex-col justify-center">
          <button
            onClick={() => setIsRevealed((prevValue) => !prevValue)}
            className="border-2 border-blue-500 w-full h-80"
          >
            <div className="text-6xl">{mainCardContents}</div>
            <div className="flex flex-col">
              {isRevealed ? revealedContents : null}
            </div>
          </button>
          <br />
          <button
            onClick={() => anotherRandomWord(currentWord)}
            className="border-green-800 border-2 m-4 h-20"
          >
            NEXT
          </button>
        </div>
      )}
    </div>
  );
}
