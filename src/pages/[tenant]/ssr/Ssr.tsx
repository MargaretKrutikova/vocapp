import { VocValue } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { trpc } from "../../../utils/trpc";

const buttonColors = [
  "bg-red-500",
  "bg-orange-500",
  "bg-yellow-400",
  "bg-green-400",
  "bg-green-700",
];

export default function SsrCard() {
  const router = useRouter();
  const tenant = router.query.tenant as string;

  const [showText, setShowText] = useState(false);
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

  const mainCardContents = translationsList;
  const revealedContents = currentWord?.value;

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
          onClick={() => setShowText((prevValue) => !prevValue)}
        >
          {showText ? "Hide text" : "Show text"}
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
            {showText ? (
              <div className="text-6xl">{mainCardContents}</div>
            ) : null}
            {currentWord?.imageUrl ? (
              <img
                src={currentWord.imageUrl}
                alt={currentWord.value}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            ) : null}
            <div className="flex flex-col">
              {isRevealed ? (
                <>
                  <div>{revealedContents}</div>
                </>
              ) : null}
            </div>
          </button>
          <br />

          {isRevealed ? (
            <div>
              {[0, 1, 2, 3, 4].map((val) => {
                return (
                  <button
                    key={val}
                    className={`border-2 ${buttonColors[val]} w-1/5 h-20`}
                    onClick={() => {
                      console.log(val);
                    }}
                  >
                    {val}
                  </button>
                );
              })}
            </div>
          ) : null}
          <button
            onClick={() => anotherRandomWord(currentWord)}
            className="border-green-800 border-2 m-4 h-20 fixed bottom-0 center w-11/12"
          >
            NEXT
          </button>
        </div>
      )}
    </div>
  );
}
