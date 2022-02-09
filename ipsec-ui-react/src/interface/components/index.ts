/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import { Ref, ChangeEvent, MouseEvent } from 'react';

type typeOfButton = {
  button: 'button';
  reset: 'reset';
  submit: 'submit';
};

export interface ButtonType {
  onClick?: () => void;
  onSubmit?: () => void;
  type?: keyof typeOfButton | undefined;
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

export interface Visualization {
  x: number;
  y: number;
  width?: number;
  height?: number;
}
