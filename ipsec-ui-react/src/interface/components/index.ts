import { Ref, ChangeEvent, MouseEvent } from 'react';

export interface ButtonType {
  onClick?: () => void;
  className?: string;
  btnDelete?: boolean;
  disabled?: boolean;
}

export interface InputType {
  name: string;
  placeholder?: string;
  type?: string;
  value?: any;
  checked?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onClick?: (e: MouseEvent<HTMLInputElement>) => void;
  references?: Ref<HTMLInputElement>;
}

export interface visualization {
  x: number;
  y: number;
  width?: number;
  height?: number;
}
