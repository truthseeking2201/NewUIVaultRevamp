import * as Icons from '@/assets/icons';
import React from 'react';

interface IconProps {
  name: keyof typeof Icons;
  color?: string;
  // You can add more props like className, style, etc.
  [key: string]: any;
}

const Icon: React.FC<IconProps> = ({ name, color = 'red', style, ...props }) => {
  const SvgIcon = Icons[name];
  if (!SvgIcon) return null;
  return (
    <SvgIcon
      style={{ color, ...style }}
      {...props}
    />
  );
};

export default Icon;
