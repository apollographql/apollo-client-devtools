import { Dialog, Transition } from "@headlessui/react";
import { Fragment, ReactNode } from "react";
import { clsx } from "clsx";

import { Body } from "./Body";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { Title } from "./Title";

interface ModalProps {
  className?: string;
  children: ReactNode;
  open: boolean;
  onClose: (value: boolean) => void;
  size: "sm" | "md" | "lg";
}

export function Modal({
  className,
  children,
  open,
  onClose,
  size,
}: ModalProps) {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black-300/50" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel
                className={clsx(
                  "relative transform overflow-hidden rounded-lg bg-primary dark:bg-primary-dark p-6 shadow-modal transition-all",
                  {
                    "w-[336px]": size === "sm",
                    "w-[400px]": size === "md",
                    "w-[464px]": size === "lg",
                  }
                )}
              >
                <div className={clsx(className, "flex flex-col")}>
                  {children}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

Modal.Body = Body;
Modal.Footer = Footer;
Modal.Header = Header;
Modal.Title = Title;
