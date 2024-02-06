import clsx from "clsx";
import { ReactNode } from "react";
import { LoadingSpinner } from "./Explorer/LoadingSpinner";
import IconCheck from "@apollo/icons/default/IconCheck.svg";
import IconError from "@apollo/icons/default/IconError.svg";

interface BannerAlertProps {
  children: ReactNode;
  type: "loading" | "success" | "error";
}

export function BannerAlert({ children, type }: BannerAlertProps) {
  return (
    <div
      className={clsx(
        "w-dvw flex items-center gap-4 fixed z-10 bottom-0 px-4 py-3",
        {
          ["bg-secondary dark:bg-secondary-dark"]: type === "loading",
          ["bg-success dark:bg-success-dark"]: type === "success",
          ["bg-error dark:bg-error-dark"]: type === "error",
        }
      )}
    >
      {type === "loading" && <LoadingSpinner size="2xsmall" />}
      {type === "success" && <IconCheck className="w-4" />}
      {type === "error" && <IconError className="w-4" />}
      <div className="text-md font-body">{children}</div>
    </div>
  );
}
