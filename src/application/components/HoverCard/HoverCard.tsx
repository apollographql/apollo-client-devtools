import * as BaseHoverCard from "@radix-ui/react-hover-card";
import { Content } from "./Content";
import { Trigger } from "./Trigger";

export function HoverCard(props: BaseHoverCard.HoverCardProps) {
  return <BaseHoverCard.Root {...props} />;
}

HoverCard.Content = Content;
HoverCard.Trigger = Trigger;
