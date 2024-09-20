import { type ComponentProps, forwardRef } from "react";
import { getPanelActor } from "../../extension/devtools/panelActor";
import { expectTypeOf } from "expect-type";

expectTypeOf<typeof import("./ExternalLink.jsx")>().toMatchTypeOf<
  typeof import("./ExternalLink.vscode.jsx")
>();

/**
 * A link that opens links using a vscode command.
 *
 * Required because sometimes VSCode blocks links from being opened.:
 *
 * > Blocked opening 'https://...' in a new window because the request was made in a sandboxed frame whose 'allow-popups' permission is not set.
 */
export const ExternalLink = forwardRef<
  HTMLAnchorElement,
  ComponentProps<"a"> & { href: string }
>((props, ref) => {
  return (
    <a
      {...props}
      ref={ref}
      onClick={(e) => {
        if (props.onClick) {
          props.onClick(e);
        }
        if (e.isDefaultPrevented()) return;

        getPanelActor(window).send({
          type: "vscode:openExternal",
          uri: props.href,
        });

        e.nativeEvent.preventDefault();
      }}
    />
  );
});
