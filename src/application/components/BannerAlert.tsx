import clsx from "clsx";
import { makeVar, useReactiveVar } from "@apollo/client";
import { ReactNode } from "react";
import { LoadingSpinner } from "./Explorer/LoadingSpinner";
import IconCheck from "@apollo/icons/default/IconCheck.svg";
import IconError from "@apollo/icons/default/IconError.svg";

const bannerVar = makeVar<BannerAlertConfig | null>(null);

type BannerAlertType = "loading" | "success" | "error";

export interface BannerAlertConfig {
  content: ReactNode;
  type: BannerAlertType;
}

export function BannerAlert() {
  const banner = useReactiveVar(bannerVar);

  if (!banner) {
    return null;
  }

  return (
    <div
      className={clsx(
        "w-dvw flex items-center gap-4 fixed z-10 bottom-0 px-4 py-3",
        {
          ["bg-secondary dark:bg-secondary-dark"]: banner.type === "loading",
          ["bg-success dark:bg-success-dark"]: banner.type === "success",
          ["bg-error dark:bg-error-dark"]: banner.type === "error",
        }
      )}
    >
      {banner.type === "loading" && <LoadingSpinner size="2xsmall" />}
      {banner.type === "success" && <IconCheck className="w-4" />}
      {banner.type === "error" && <IconError className="w-4" />}
      <div className="text-md font-body">{banner.content}</div>
    </div>
  );
}

BannerAlert.show = (config: BannerAlertConfig) => {
  bannerVar(config);

  return () => {
    bannerVar(null);
  };
};
