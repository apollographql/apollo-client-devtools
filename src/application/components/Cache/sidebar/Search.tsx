import { IconSearch } from "@apollo/space-kit/icons/IconSearch";
import { clsx } from "clsx";

interface SearchProps {
  value: string;
  onChange: (value: string) => void;
}

export const Search = ({ onChange, value }: SearchProps) => {
  return (
    <div className="mb-2 border-b border-b-primary dark:border-b-primary-dark">
      <label className="prose">
        <div className="relative">
          <div className="absolute inline-flex left-3 top-1/2 -translate-y-1/2">
            <IconSearch className="h-4 w-4 text-icon-primary dark:text-icon-primary-dark" />
          </div>
          <input
            placeholder="Search queries"
            onChange={(e) => onChange(e.target.value)}
            value={value}
            className={clsx(
              "[background:none] flex-1 rounded w-full pr-2 pl-9 -mr-8 prose-sm h-7",
              "placeholder:text-placeholder dark:placeholder:text-placeholder-dark",
              "focus:outline-none"
            )}
          />
        </div>
      </label>
    </div>
  );
};
