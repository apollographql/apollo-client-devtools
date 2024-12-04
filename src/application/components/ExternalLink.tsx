import { type ComponentProps, forwardRef } from "react";

export const ExternalLink = forwardRef<
  HTMLAnchorElement,
  ComponentProps<"a"> & { href: string }
>((props, ref) => {
  return <a target="_blank" rel="noopener noreferrer" {...props} ref={ref} />;
});
