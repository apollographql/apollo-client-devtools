import { Dispatch, Fragment, MutableRefObject, SetStateAction } from "react";
import { Dialog, Transition } from "@headlessui/react";

declare const VERSION: string;

export function Modal({
  open,
  setOpen,
  cancelButtonRef,
}: {
  open: boolean;
  cancelButtonRef: MutableRefObject<null>;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        initialFocus={cancelButtonRef}
        onClose={setOpen}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-grey-darker bg-opacity-75 transition-opacity" />
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full max-w-sm sm:p-6">
                <div>
                  <div className="mt-1">
                    <Dialog.Title
                      as="h3"
                      className="text-base font-semibold leading-6 mb-6"
                    >
                      Settings
                    </Dialog.Title>
                    <div className="mt-2 text-sm">
                      <p>
                        Devtools version:{" "}
                        <a
                          className="underline text-purple-darker font-monospace"
                          target="_blank"
                          rel="noopener noreferrer"
                          href={`https://github.com/apollographql/apollo-client-devtools/releases/tag/v${VERSION}`}
                        >
                          {VERSION}
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
