import { cva } from "class-variance-authority";
import type { ComponentPropsWithoutRef } from "react";
import { useMemo } from "react";
import { CardProvider } from "./CardContext";
import { twMerge } from "tailwind-merge";

interface CardProps extends ComponentPropsWithoutRef<"div"> {
  variant?: "filled" | "outline" | "unstyled";
}

const card = cva(
  [
    "flex",
    "flex-col",
    "rounded-lg",
    "relative",
    "min-w-0",
    "break-words",
    "has-[[data-card-element=body]>table]:overflow-hidden",
  ],
  {
    variants: {
      variant: {
        filled: [],
        outline: [
          "border",
          "border-primary",
          "dark:border-primary-dark",
          "shadow-cards",
        ],
        unstyled: [],
      },
    },
  }
);

export function Card({ children, className, variant = "outline" }: CardProps) {
  const context = useMemo(() => ({ variant }), [variant]);

  return (
    <CardProvider value={context}>
      <div className={twMerge(card({ variant }), className)}>{children}</div>
    </CardProvider>
  );
}

// const baseStyle = definePartsStyle({
//   header: {
//     [$groupSpacingY.variable]: 'space.2',
//     [$groupSpacingX.variable]: 'space.2',
//     display: 'flex',
//     flexDirection: 'column',
//     gap: 2,
//     padding: false,
//     pt: $outerPaddingY.reference,
//     pb: 4,
//     px: $outerPaddingX.reference,
//     '&:last-child': {
//       pb: $outerPaddingY.reference,
//     },
//     '[data-is-divided=true] > &:not(:last-child)': {
//       borderBottom: '1px solid',
//       borderBottomColor: border.primary,
//     },
//     '&:has(> .orbit-group + .orbit-card__header-control)': {
//       columnGap: 6,
//     },
//     '> .orbit-group[data-direction="horizontal"]:has(> .orbit-group[data-direction="vertical"] + .orbit-card__header-control)':
//       {
//         [$groupSpacingX.variable]: 'space.6',
//       },
//   },
//   headerControl: {
//     alignSelf: 'start',
//     display: 'flex',
//     gap: 3,
//     alignItems: 'center',
//     '& .chakra-form__label': {
//       fontSize: 'sm',
//       lineHeight: 'sm',
//       fontWeight: 'semibold',
//     },
//   },
//   body: {
//     [$bodyPaddingX.variable]: 0,
//     color: text.primary,
//     display: 'flex',
//     flexDirection: 'column',
//     gap: 4,
//     padding: false,
//     pt: 4,
//     pb: 4,
//     px: $outerPaddingX.reference,
//     '&:last-child': {
//       pb: $outerPaddingY.reference,
//     },
//     '&:has(> .chakra-table__container, > .chakra-table)': {
//       [$bodyPaddingX.variable]: $outerPaddingX.reference,
//       px: 0,
//       overflowY: 'auto',
//     },
//     '&:has(> .chakra-table__container:first-child, > .chakra-table:first-child)':
//       {
//         pt: 0,
//       },
//     '&:has(> .chakra-table__container:last-child, > .chakra-table:last-child)':
//       {
//         pb: 0,
//       },
//     '&:first-of-type': {
//       '&:has(.chakra-table__container)': {
//         pt: 0,
//       },
//       pt: $outerPaddingY.reference,
//     },
//   },
//   title: {
//     display: 'flex',
//     gap: 2,
//     alignItems: 'center',
//   },
//   footer: {
//     '[data-is-divided=true] > &:not(:first-child)': {
//       borderTop: '1px solid',
//       borderTopColor: border.primary,
//     },
//     '&:has(.orbit-pagination__container)': {
//       p: 0,
//     },
//     '.chakra-card__body:has(.chakra-table__container:only-child, .chakra-table:only-child) + &:has(.orbit-pagination__container)':
//       {
//         borderTop: '1px solid',
//         borderColor: border.primary,
//       },
//   },
// });
//
// const tableOverflowContainer = defineStyle({
//   '&:has(.chakra-card__body > .chakra-table__container, .chakra-card__body > .chakra-table)':
//     {
//       overflow: 'hidden',
//     },
// });
//
// const tableBorderOverrides = defineStyle({
//   '[data-is-divided=true] &:not(last-child) .chakra-table:last-child tr:last-child td':
//     {
//       borderBottom: 'none',
//     },
//   '&:last-child .chakra-table:last-child tr:last-child td': {
//     borderBottom: 'none',
//   },
//   '&:has(+ .chakra-card__footer > .orbit-pagination__container) .chakra-table:last-child tr:last-child td':
//     {
//       borderBottom: 'none',
//     },
// });
//
// const variantOutline = definePartsStyle({
//   container: {
//     [$bg.variable]: bg.primary,
//     [$borderColor.variable]: border.primary,
//     [$radius.variable]: '0.5rem',
//     [$border.variable]: '1px',
//     [$outerPaddingY.variable]: 'space.6',
//     [$outerPaddingX.variable]: 'space.6',
//     color: text.primary,
//     boxShadow: 'cards',
//     ...tableOverflowContainer,
//   },
//   body: {
//     ...tableBorderOverrides,
//   },
// });
//
// const variantFilled = definePartsStyle({
//   container: {
//     [$bg.variable]: bg.secondary,
//     [$borderColor.variable]: border.primary,
//     [$radius.variable]: '0.5rem',
//     [$border.variable]: '1px',
//     [$outerPaddingY.variable]: 'space.6',
//     [$outerPaddingX.variable]: 'space.6',
//     color: text.primary,
//     ...tableOverflowContainer,
//   },
//   body: {
//     ...tableBorderOverrides,
//   },
// });
//
// const variantUnstyled = definePartsStyle({
//   container: {
//     [$bg.variable]: false,
//     [$outerPaddingY.variable]: 'space.0',
//     [$outerPaddingX.variable]: 'space.0',
//     backgroundColor: false,
//     boxShadow: false,
//   },
// });
//
// export const CardStyles = defineMultiStyleConfig({
//   baseStyle,
//   variants: {
//     outline: variantOutline,
//     unstyled: variantUnstyled,
//     filled: variantFilled,
//   },
//   defaultProps: {
//     variant: 'outline',
//   },
// });
//
