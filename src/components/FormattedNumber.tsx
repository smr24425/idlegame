import React from 'react';
import { formatNumber } from '../utils/logic';

interface FormattedNumberProps {
  value: number;
  style?: React.CSSProperties;
  className?: string;
}

export const FormattedNumber: React.FC<FormattedNumberProps> = ({ value, style, className }) => {
  return <span style={style} className={className}>{formatNumber(value)}</span>;
};
