import { VocValue } from "@prisma/client";
import { Dispatch, Reducer, useEffect, useReducer } from "react";
import {
  createEmptyLanguageValues,
  createLanguageValuesFromVocItems,
  Language,
  LanguageValues,
} from "../languages";

export type WordFormState = {
  word: string;
  imageUrl: string;
  language: Language;
  translations: LanguageValues;
  explanations: LanguageValues;
  usages: LanguageValues;
};

export type WordFormAction =
  | { type: "SetWord"; word: string }
  | { type: "SetImageUrl"; imageUrl: string }
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
    case "SetImageUrl":
      return { ...state, imageUrl: action.imageUrl };
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
  }
};

const createInitWordFormState = (): WordFormState => ({
  word: "",
  imageUrl: "",
  language: "es",
  translations: createEmptyLanguageValues(),
  explanations: createEmptyLanguageValues(),
  usages: createEmptyLanguageValues(),
});

const createStateFromVocValue = (vocValue: VocValue): WordFormState => ({
  word: vocValue.value,
  imageUrl: vocValue.imageUrl ?? "",
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
