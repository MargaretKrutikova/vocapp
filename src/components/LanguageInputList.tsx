import { useState } from "react";
import { DEFAULT_TRANSLATION_LANGUAGE, LanguageValues } from "../languages";
import { TextField } from "./TextField";

type Props = {
  languageValues: LanguageValues;
  onChange: (inputs: LanguageValues) => void;
};

export const LanguageInputList = ({ languageValues, onChange }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div>
      {[...languageValues.entries()].map(([language, value]) =>
        isExpanded || language === DEFAULT_TRANSLATION_LANGUAGE ? (
          <div key={language} className="flex">
            {language}:
            <TextField
              value={value}
              onTextChange={(value: string) =>
                onChange(new Map(languageValues).set(language, value))
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
