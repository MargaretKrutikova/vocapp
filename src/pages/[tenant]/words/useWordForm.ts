import { Dispatch, Reducer, useReducer } from "react";
import {
  createEmptyLanguageValues,
  Language,
  LanguageValues,
} from "../../../languages";

export type WordFormState = {
  word: string;
  language: Language;
  translations: LanguageValues;
  explanations: LanguageValues;
  usages: LanguageValues;
};

export type WordFormAction =
  | { type: "SetWord"; word: string }
  | { type: "SetLanguage"; lang: Language }
  | { type: "SetTranslations"; translations: LanguageValues }
  | { type: "SetExplanations"; explanations: LanguageValues }
  | { type: "SetUsages"; usages: LanguageValues }
  | { type: "ClearForm" };

const reducer: Reducer<WordFormState, WordFormAction> = (
  state: WordFormState,
  action: WordFormAction
) => {
  switch (action.type) {
    case "SetWord":
      return { ...state, word: action.word };
    case "SetLanguage":
      return { ...state, language: action.lang };
    case "SetTranslations":
      return { ...state, translations: action.translations };
    case "SetExplanations":
      return { ...state, explanations: action.explanations };
    case "SetUsages":
      return { ...state, usages: action.usages };
    case "ClearForm":
      return createInitWordFormState();

    default:
      return state;
  }
};

const createInitWordFormState = (): WordFormState => ({
  word: "",
  language: "es",
  translations: createEmptyLanguageValues(),
  explanations: createEmptyLanguageValues(),
  usages: createEmptyLanguageValues(),
});

export const useWordForm = (
  wordState?: WordFormState
): [WordFormState, Dispatch<WordFormAction>] => {
  const initialState = wordState || createInitWordFormState();
  const [state, dispatch] = useReducer(reducer, initialState);
  return [state, dispatch];
};
