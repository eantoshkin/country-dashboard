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
    }
  }
}
