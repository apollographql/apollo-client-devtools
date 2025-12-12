import { Fragment, type ReactNode, isValidElement } from "react";

interface Props {
  delimeter: ReactNode;
  children: ReactNode[];
}

export function Join({ delimeter, children }: Props) {
  return (
    <>
      {children.map((child, idx) => {
        return (
          <Fragment
            key={isValidElement(child) ? (child.props as any)?.key : idx}
          >
            {child}
            {delimeter}
          </Fragment>
        );
      })}
    </>
  );
}
