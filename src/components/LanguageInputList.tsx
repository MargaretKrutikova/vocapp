import { Language } from "../languages";
import { TranslationInput } from "./TranslationInput";

export type LanguageInput = {
  value: string;
  language: Language;
};

type Props = {
  inputs: LanguageInput[];
  onChange: (inputs: LanguageInput[]) => void;
};

export const LanguageInputList = (props: Props) => {
  const handleTextChange = (value: string, index: number) => {
    const modifiedInputs = props.inputs.map((input, ind) =>
      ind === index ? { ...input, value } : input
    );
    props.onChange(modifiedInputs);
  };
  const handleLanguageChange = (language: Language, index: number) => {
    const modifiedInputs = props.inputs.map((input, ind) =>
      ind === index ? { ...input, language } : input
    );
    props.onChange(modifiedInputs);
  };

  return (
    <div>
      {props.inputs.map((input, index) => (
        <TranslationInput
          key={input.language}
          language={input.language}
          value={input.value}
          onTextChange={(value: string) => handleTextChange(value, index)}
          onLanguageChange={(language: Language) =>
            handleLanguageChange(language, index)
          }
        />
      ))}
    </div>
  );
};
