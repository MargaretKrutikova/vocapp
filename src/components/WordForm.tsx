import { Dispatch } from "react";
import { LanguageInputList } from "./LanguageInputList";
import { LanguageSelector } from "./LanguageSelector";
import { TextField } from "./TextField";
import { WordFormAction, WordFormState } from "../hooks/useWordForm";

type Props = {
  state: WordFormState;
  dispatch: Dispatch<WordFormAction>;
  canSaveWord: boolean;
  onSave: () => void;
};

export const WordForm = ({ state, dispatch, canSaveWord, onSave }: Props) => {
  return (
    <div className="m-2">
      <div className="flex">
        <TextField
          autoFocus={true}
          tabIndex={0}
          placeholder="Word or phrase"
          value={state.word}
          onTextChange={(word) => dispatch({ type: "SetWord", word })}
        />
        <TextField
          tabIndex={1}
          placeholder="Image URL (optional)"
          value={state.imageUrl ?? ""}
          onTextChange={(imageUrl) =>
            dispatch({ type: "SetImageUrl", imageUrl })
          }
        />
        <LanguageSelector
          language={state.language}
          onLanguageChange={(lang) => dispatch({ type: "SetLanguage", lang })}
        />
      </div>

      <LanguageInputList
        languageValues={state.translations}
        onChange={(translations) =>
          dispatch({ type: "SetTranslations", translations })
        }
        type="input"
      />
      <LanguageInputList
        languageValues={state.explanations}
        onChange={(explanations) =>
          dispatch({ type: "SetExplanations", explanations })
        }
        title="Explanations"
      />
      <LanguageInputList
        languageValues={state.usages}
        onChange={(usages) => dispatch({ type: "SetUsages", usages })}
        title="Usages"
      />

      <button
        className={`${
          !canSaveWord ? "bg-gray-300" : "bg-violet-500 hover:bg-violet-700"
        } text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline`}
        disabled={!canSaveWord}
        onClick={onSave}
      >
        Save 💾
      </button>
    </div>
  );
};
