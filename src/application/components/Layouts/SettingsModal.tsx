import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";

declare const VERSION: string;

export function SettingsModal({
  open = false,
  onOpen,
}: {
  open?: boolean;
  onOpen: (open: boolean) => void;
}) {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog className="relative z-10" onClose={onOpen}>
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
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-primary dark:bg-primary-dark border border-primary dark:border-primary-dark p-6 text-left shadow-xl transition-all sm:my-8 sm:w-full max-w-sm">
                <div className="flex flex-col gap-2">
                  <Dialog.Title
                    as="h3"
                    className="prose-lg text-heading dark:text-heading-dark"
                  >
                    Settings
                  </Dialog.Title>
                  <p>
                    Devtools version:{" "}
                    <a
                      className="font-code"
                      target="_blank"
                      rel="noopener noreferrer"
                      href={`https://github.com/apollographql/apollo-client-devtools/releases/tag/v${VERSION}`}
                    >
                      {VERSION}
                    </a>
                  </p>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
