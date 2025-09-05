import { cn } from "@/lib/utils";
import { ReactNode, Children } from "react";

type Props = {
  children?: ReactNode;
  label?: string;
  className?: string;
  classNameLabel?: string;
  classNameValue?: string;
};

type content = {
  children?: ReactNode;
};

const RowItem = (props: Props) => {
  let _label, _value;
  const _className = props?.className || "";
  const _classNameLabel =
    props?.classNameLabel || "test-base text-gray-400 font-sans";
  const _classNameValue =
    props?.classNameValue || "text-lg font-mono text-white";

  Children.forEach(props.children, (child: any) => {
    if (child && child.type === RowItemLabel) {
      return (_label = child);
    }
    if (child && child.type === RowItemValue) {
      return (_value = child);
    }
  });

  if (!_label) _label = <>{props?.label}</>;
  if (!_value) _value = <>{props.children}</>;

  return (
    <div className={cn("flex justify-between items-center gap-2", _className)}>
      <div className={_classNameLabel}>{_label}</div>
      <div className={_classNameValue}>{_value}</div>
    </div>
  );
};
const RowItemLabel = (props: content) => <>{props.children}</>;
const RowItemValue = (props: content) => <>{props.children}</>;

RowItem.Label = RowItemLabel;
RowItem.Value = RowItemValue;

export { RowItem };
