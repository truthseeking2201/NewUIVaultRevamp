import { ReactNode } from "react";

export interface OptionsSelectType {
  value: string;
  label: string | ReactNode;
  disabled?: boolean;
}
