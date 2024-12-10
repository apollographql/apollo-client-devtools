import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import type { ReactNode } from "react";
import { Fragment } from "react";
import { clsx } from "clsx";

import { Body } from "./Body";
import { Description } from "./Description";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { Title } from "./Title";

interface ModalProps {
  className?: string;
  children: ReactNode;
  open: boolean;
  onClose?: (value: boolean) => void;
  size: "sm" | "md" | "lg" | "xl";
}

function noop() {}

export function Modal({
  className,
  children,
  open,
  onClose = noop,
  size,
}: ModalProps) {
  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black-300/50" />
        </TransitionChild>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <DialogPanel
                className={clsx(
                  "relative transform overflow-hidden rounded-lg bg-primary dark:bg-primary-dark shadow-modal transition-all",
                  {
                    "w-modal-sm": size === "sm",
                    "w-modal-md": size === "md",
                    "w-modal-lg": size === "lg",
                    "w-modal-xl": size === "xl",
                  }
                )}
              >
                <div className={clsx(className, "flex flex-col")}>
                  {children}
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

Modal.Body = Body;
Modal.Description = Description;
Modal.Footer = Footer;
Modal.Header = Header;
Modal.Title = Title;
