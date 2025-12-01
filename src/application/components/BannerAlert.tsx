import clsx from "clsx";
import { makeVar } from "@apollo/client";
import { useReactiveVar } from "@apollo/client/react";
import type { ReactNode } from "react";
import IconCheck from "@apollo/icons/default/IconCheck.svg";
import IconError from "@apollo/icons/default/IconError.svg";
import { AnimatePresence, motion } from "motion/react";
import { Spinner } from "./Spinner";

const bannerVar = makeVar<BannerAlertConfig | null>(null);

type BannerAlertType = "loading" | "success" | "error";

export interface BannerAlertConfig {
  content: ReactNode;
  type: BannerAlertType;
}

export function BannerAlert() {
  const banner = useReactiveVar(bannerVar);

  return (
    <AnimatePresence>
      {banner && (
        <motion.div
          key="banner"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", bounce: 0.15 }}
          className={clsx(
            "w-dvw flex items-center gap-4 fixed z-10 bottom-0 px-4 py-3 h-11",
            {
              ["bg-secondary dark:bg-secondary-dark"]:
                banner.type === "loading",
              ["bg-success dark:bg-success-dark"]: banner.type === "success",
              ["bg-error dark:bg-error-dark"]: banner.type === "error",
            }
          )}
        >
          {banner.type === "loading" && <Spinner size="xs" />}
          {banner.type === "success" && <IconCheck className="w-4" />}
          {banner.type === "error" && <IconError className="w-4" />}
          <div className="text-sm font-body flex-1">{banner.content}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

BannerAlert.show = (config: BannerAlertConfig) => {
  bannerVar(config);
};

BannerAlert.close = () => {
  bannerVar(null);
};
