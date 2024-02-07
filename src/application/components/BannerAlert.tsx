import clsx from "clsx";
import { makeVar, useReactiveVar } from "@apollo/client";
import { ReactNode } from "react";
import { LoadingSpinner } from "./Explorer/LoadingSpinner";
import IconCheck from "@apollo/icons/default/IconCheck.svg";
import IconError from "@apollo/icons/default/IconError.svg";
import { Transition } from "@headlessui/react";

const bannerVar = makeVar<BannerAlertConfig | null>(null);

type BannerAlertType = "loading" | "success" | "error";

export interface BannerAlertConfig {
  content: ReactNode;
  type: BannerAlertType;
}

export function BannerAlert() {
  const banner = useReactiveVar(bannerVar);

  return (
    <Transition
      show={Boolean(banner)}
      className="duration-500"
      enter="transition-opacity"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      {banner && (
        <div
          className={clsx(
            "w-dvw flex items-center gap-4 fixed z-10 bottom-0 px-4 py-3",
            {
              ["bg-secondary dark:bg-secondary-dark"]:
                banner.type === "loading",
              ["bg-success dark:bg-success-dark"]: banner.type === "success",
              ["bg-error dark:bg-error-dark"]: banner.type === "error",
            }
          )}
        >
          {banner.type === "loading" && <LoadingSpinner size="2xsmall" />}
          {banner.type === "success" && <IconCheck className="w-4" />}
          {banner.type === "error" && <IconError className="w-4" />}
          <div className="text-sm font-body">{banner.content}</div>
        </div>
      )}
    </Transition>
  );
}

BannerAlert.show = (config: BannerAlertConfig) => {
  bannerVar(config);

  return () => {
    bannerVar(null);
  };
};
