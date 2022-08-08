import { VocValue } from "@prisma/client";
import { Dispatch, Reducer, useEffect, useReducer } from "react";
import {
  createEmptyLanguageValues,
  createLanguageValuesFromVocItems,
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
  | { type: "ClearForm" }
  | { type: "InitState"; state: WordFormState };

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
    case "InitState":
      return action.state;

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

const createStateFromVocValue = (vocValue: VocValue): WordFormState => ({
  word: vocValue.value,
  language: vocValue.language as Language,
  translations: createLanguageValuesFromVocItems(vocValue.translations),
  explanations: createLanguageValuesFromVocItems(vocValue.explanations),
  usages: createLanguageValuesFromVocItems(vocValue.usages),
});

export const useWordForm = (
  vocValue?: VocValue | null
): [WordFormState, Dispatch<WordFormAction>] => {
  const initialState = vocValue
    ? createStateFromVocValue(vocValue)
    : createInitWordFormState();

  const [state, dispatch] = useReducer(reducer, initialState);
  useEffect(() => {
    if (vocValue) {
      dispatch({ type: "InitState", state: createStateFromVocValue(vocValue) });
    }
  }, [vocValue]);

  return [state, dispatch];
};
