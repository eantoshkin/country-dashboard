import type * as React from "react";

type MdElementProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement>,
  HTMLElement
>;

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "md-tabs": MdElementProps & { "aria-label"?: string };
      "md-primary-tab": MdElementProps & { active?: boolean };
      "md-filled-button": MdElementProps & {
        href?: string;
        target?: string;
        trailingIcon?: boolean;
      };
      "md-outlined-button": MdElementProps & {
        href?: string;
        target?: string;
        trailingIcon?: boolean;
      };
      "md-text-button": MdElementProps & {
        href?: string;
        target?: string;
        trailingIcon?: boolean;
      };
      "md-icon": MdElementProps & { slot?: string };
      "md-divider": MdElementProps & { inset?: boolean };
      "md-linear-progress": MdElementProps & {
        value?: number;
        max?: number;
        indeterminate?: boolean;
      };
      "md-elevation": MdElementProps;
    }
  }
}
