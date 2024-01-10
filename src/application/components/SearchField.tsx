import { clsx } from "clsx";
import { SearchIcon } from "./icons/Search";

interface SearchFieldProps {
  autoFocus?: boolean;
  className?: string;
  placeholder?: string;
  onChange: (value: string) => void;
  value: string;
}

export function SearchField({
  autoFocus,
  className,
  placeholder = "Search",
  onChange,
  value,
}: SearchFieldProps) {
  return (
    <div className={clsx(className, "flex items-center relative")}>
      <SearchIcon className="absolute left-4 w-4 h-4 z-10 text-icon-secondary dark:text-icon-secondary-dark" />
      <input
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        value={value}
        type="text"
        className={clsx(
          "h-10 w-full border-2 bg-input rounded-[6px] pl-11 pr-4 dark:bg-input-dark border-primary dark:border-primary-dark placeholder:text-placeholder placeholder:dark:text-placeholder-dark",
          "focus:border-focused focus:dark:border-focused-dark focus:outline-none focus:border-2",
          "disabled:bg-disabled disabled:dark:bg-disabled-dark disabled:text-disabled disabled:dark:text-disabled disabled:border-secondary disabled:dark:border-secondary-dark disabled:placeholder:text-disabled disabled:dark:placeholder:text-disabled-dark disabled:cursor-not-allowed"
        )}
      />
    </div>
  );
}
