import { useState } from "react";
import { DEFAULT_TRANSLATION_LANGUAGE, LanguageValues } from "../languages";
import { TextArea } from "./TextArea";
import { TextField } from "./TextField";

type Props = {
  languageValues: LanguageValues;
  onChange: (inputs: LanguageValues) => void;
  type?: "input" | "textarea";
  title?: string;
};

export const LanguageInputList = ({
  languageValues,
  type = "textarea",
  onChange,
  title,
}: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const TextTag = type === "input" ? TextField : TextArea;

  return (
    <div>
      {title ? <div>{title}</div> : null}
      {[...languageValues.entries()].map(([language, value]) =>
        isExpanded || language === DEFAULT_TRANSLATION_LANGUAGE ? (
          <div key={language} className="flex">
            {language}:
            <TextTag
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
        className="border-black border-2"
        value={isExpanded ? "Collapse" : "Expand"}
        onClick={() => setIsExpanded((prevValue) => !prevValue)}
      />
    </div>
  );
};
