import { useState } from "react";
import {
  DEFAULT_TRANSLATION_LANGUAGE,
  Language,
  LanguageValues,
} from "../languages";
import { TextField } from "./TextField";

type Props = {
  languageValues: LanguageValues;
  onChange: (inputs: LanguageValues) => void;
};

export const LanguageInputList = ({ languageValues, onChange }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleTextChange = (value: string, lang: Language) => {
    const updatedRecord = { ...languageValues };
    updatedRecord[lang] = value;
    onChange(updatedRecord);
  };

  return (
    <div>
      {Object.keys(languageValues).map((language) =>
        isExpanded || language === DEFAULT_TRANSLATION_LANGUAGE ? (
          <div key={language} className="flex">
            {language}:
            <TextField
              value={languageValues[language as Language]}
              onTextChange={(value: string) =>
                handleTextChange(value, language as Language)
              }
            />
          </div>
        ) : null
      )}
      <input
        type="button"
        value="Expand or Collapse"
        onClick={() => setIsExpanded((prev) => !prev)}
      />
    </div>
  );
};
