import { useRouter } from "next/router";
import { mapLanguageValues } from "../../../languages";
import { trpc } from "../../../utils/trpc";
import { useWordForm } from "../../../hooks/useWordForm";
import { WordForm } from "../../../components/WordForm";

export default function EditWord() {
  const router = useRouter();
  const id = router.query.id as string;

  const {
    data: word,
    error: errorLoadingWord,
    isLoading: isLoadingWord,
  } = trpc.useQuery(["vocabulary.getById", { id }]);

  const { mutate: performEditWordMutation, isLoading: isSavingWord } =
    trpc.useMutation(["vocabulary.edit"], {
      onSuccess: () => {
        if (typeof window !== "undefined" && word) {
          router.push(`/${word.tenant}/words`);
        }
      },
    });

  const [wordState, dispatch] = useWordForm(word);

  const canSave =
    !(isLoadingWord || errorLoadingWord || isSavingWord) &&
    wordState.word.length > 0;

  const saveWord = () => {
    if (canSave) {
      performEditWordMutation({
        id,
        value: wordState.word.trim(),
        language: wordState.language,
        translations: mapLanguageValues(wordState.translations),
        explanations: mapLanguageValues(wordState.explanations),
        usages: mapLanguageValues(wordState.usages),
      });
    }
  };

  return isLoadingWord ? (
    <div>Spinner...</div>
  ) : (
    <WordForm
      state={wordState}
      dispatch={dispatch}
      onSave={saveWord}
      canSaveWord={canSave}
    />
  );
}
