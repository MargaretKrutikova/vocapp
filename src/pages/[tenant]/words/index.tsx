import { useRouter } from "next/router";
import React from "react";
import { useQueryClient } from "react-query";
import { trpc } from "../../../utils/trpc";

function Words() {
  const router = useRouter();
  const tenant = router.query.tenant as string;

  const queryClient = useQueryClient();

  const queryName = "vocabulary.getAll";

  const { data: words, error, isLoading } = trpc.useQuery([queryName]);
  const { mutate: performAddWordMutation } = trpc.useMutation(
    ["vocabulary.add"],
    {
      onSuccess: () => {
        queryClient.invalidateQueries([queryName]);
      },
    }
  );

  const [word, setWord] = React.useState("");
  const addWord = (word: string) => {
    performAddWordMutation({ value: word, tenant });
    setWord("");
  };

  return (
    <div>
      <h6 className="text-xl md:text-[1rem] leading-normal font-extrabold text-gray-700">
        Words in {tenant}:
      </h6>

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
          <input
            className="
                form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding 
                border border-solid border-gray-300 rounded
                focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none
              "
            placeholder="Word or phrase"
            value={word}
            onChange={(e) => setWord(() => e.target.value)}
          />
          <button
            className="bg-violet-500 hover:bg-violet-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
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
