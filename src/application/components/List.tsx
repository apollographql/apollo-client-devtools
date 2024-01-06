import { ComponentPropsWithoutRef } from "react";

type ListProps = ComponentPropsWithoutRef<"div">;

export function List(props: ListProps) {
  return <div {...props} />;
}
