import classnames from "classnames";
import { Language, languages } from "../languages";

type Props = {
  language: Language;
  onLanguageChange: (value: Language) => void;
} & Omit<React.HTMLProps<HTMLSelectElement>, "onChange">;

export const LanguageSelector = ({
  className,
  language,
  onLanguageChange,
}: Props) => (
  <select
    className={classnames(
      `form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding 
        border border-solid border-gray-300 rounded
        focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none`,
      className
    )}
    value={language}
    onChange={(e) => onLanguageChange(e.target.value as Language)}
  >
    {languages.map((l) => (
      <option key={l} value={l}>
        {l}
      </option>
    ))}
  </select>
);
