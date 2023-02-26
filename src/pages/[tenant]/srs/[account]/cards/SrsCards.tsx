import formatDistanceToNow from "date-fns/formatDistanceToNow";
import Link from "next/link";
import { useRouter } from "next/router";
import { trpc } from "../../../../../utils/trpc";

export default function SrsCards() {
  const router = useRouter();
  const tenant = router.query.tenant as string;
  const account = router.query.account as string;

  const {
    data: flashCards,
    error: errorLoadingCards,
    isLoading: isLoadingCards,
  } = trpc.useQuery(["vocabulary.getFlashCards", { tenant, account }]);

  if (errorLoadingCards) return <div>Error!</div>;

  return (
    <div>
      <h6 className="text-xl md:text-[1rem] leading-normal font-extrabold text-gray-700 flex justify-between">
        <span>
          SRS FlashCards for {account} in{" "}
          <Link href={`/${tenant}/words/${tenant}`}>
            <a className="underline text-blue-800">{tenant}</a>
          </Link>
          . Total: {flashCards?.length}.
        </span>
      </h6>
      {isLoadingCards ? (
        <div>Spinner...</div>
      ) : (
        <div className="flex flex-col justify-center m-2">
          {flashCards?.map((flashCard) => {
            return (
              <div key={flashCard.vocValueId}>
                <Link
                  href={`/${tenant}/srs/${account}/attempts/${flashCard.vocValueId}`}
                >
                  {flashCard.vocValue.value}
                </Link>
                (n:
                {flashCard.bucket}), next review:{" "}
                {formatDistanceToNow(flashCard.nextReviewDate, {
                  addSuffix: true,
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
