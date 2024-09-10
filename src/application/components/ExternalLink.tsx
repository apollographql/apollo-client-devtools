import { type ComponentProps, forwardRef } from "react";

export const ExternalLink = forwardRef<
  HTMLAnchorElement,
  ComponentProps<"a"> & { href: string }
>((props, ref) => {
  return <a {...props} ref={ref} />;
});
