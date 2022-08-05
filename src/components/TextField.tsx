import classnames from "classnames";

type Props = {
  onTextChange: (value: string) => void;
} & Omit<React.HTMLProps<HTMLInputElement>, "onChange">;

export const TextField = ({ className, onTextChange, ...rest }: Props) => (
  <input
    className={classnames(
      `form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding 
        border border-solid border-gray-300 rounded
        focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none`,
      className
    )}
    onChange={(e) => onTextChange(e.target.value)}
    {...rest}
  />
);
