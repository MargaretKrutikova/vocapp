import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { trpc } from "../../../../utils/trpc";

const buttonColors = [
  "bg-red-500",
  "bg-orange-500",
  "bg-yellow-400",
  "bg-green-400",
  "bg-green-700",
];

const gradingTable: Record<number, string> = {
  1: "Blackout",
  2: "Failed",
  3: "Diff",
  4: "Good",
  5: "Easy",
};

export default function SrsCard() {
  const router = useRouter();
  const tenant = router.query.tenant as string;
  const account = router.query.account as string;

  const [showText, setShowText] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const {
    data: flashCards,
    error: errorLoadingCards,
    isLoading: isLoadingCards,
  } = trpc.useQuery(["vocabulary.getFlashCardsToReview", { tenant, account }]);

  if (errorLoadingCards) return <div>Error!</div>;

  console.log({ flashCards });
  const currentCard = flashCards?.[currentIndex] ?? null;

  const translationsList = currentCard?.vocValue.translations.map((t) => (
    <div key={t.value}>{t.value}</div>
  ));

  const mainCardContents = translationsList;
  const revealedContents = currentCard?.vocValue.value;

  const reviewDone = () => currentIndex >= (flashCards?.length ?? 0);

  return (
    <div>
      <h6 className="text-xl md:text-[1rem] leading-normal font-extrabold text-gray-700 flex justify-between">
        <span>
          SRS for {account} in{" "}
          <Link href={`/${tenant}/words`}>
            <a className="underline text-blue-800">{tenant}</a>
          </Link>
          . Total: {flashCards?.length}. Covered: {currentIndex}
        </span>

        <button
          className="border-black border-2"
          onClick={() => setShowText((prevValue) => !prevValue)}
        >
          {showText ? "Hide text" : "Show text"}
        </button>
      </h6>
      {isLoadingCards ? (
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
            {currentCard?.vocValue.imageUrl ? (
              <img
                src={currentCard.vocValue.imageUrl}
                alt={currentCard.vocValue.value}
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
                    {val + 1}
                    <br />
                    <span style={{ fontSize: 10 }}>
                      {gradingTable[val + 1]}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}
          {reviewDone() ? (
            <div>DONE!</div>
          ) : (
            <button
              onClick={() => {
                setIsRevealed(false);

                // TODO: Report score -> Add to attempts collection
                // TODO: Run through SRS Algorithm
                // TODO: Update FlashCard with CardState (bucket, eFactor and nextReviewDate)

                setCurrentIndex((oldIndex) => oldIndex + 1);
                if (reviewDone()) return;
              }}
              className="border-green-800 border-2 m-4 h-20 fixed bottom-0 center w-11/12"
            >
              NEXT
            </button>
          )}
        </div>
      )}
    </div>
  );
}
