import { Language } from "../languages";
import { LanguageSelector } from "./LanguageSelector";
import { TextField } from "./TextField";

type Props = {
  language: Language;
  onTextChange: (value: string) => void;
  onLanguageChange: (value: Language) => void;
} & Omit<React.HTMLProps<HTMLInputElement>, "onChange">;

export const TranslationInput = ({
  className,
  onTextChange,
  onLanguageChange,
  language,
  ...rest
}: Props) => (
  <div style={{ border: "1px solid red" }}>
    <TextField onTextChange={onTextChange} {...rest} />
    <LanguageSelector language={language} onLanguageChange={onLanguageChange} />
  </div>
);
