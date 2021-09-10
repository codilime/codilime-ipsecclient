import { ChangeEvent, MouseEvent, Ref } from 'react';

export interface InputTypeProps {
  type: string;
  name: string;
  references: Ref<HTMLInputElement>;
  placeholder?: string;
  value?: string | number;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onClick?: (e: MouseEvent<HTMLInputElement>) => void;
  checked?: boolean;
}

export interface ButtonTypeProps {
  name: string;
  className?: string;
  disabled?: boolean;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
}
