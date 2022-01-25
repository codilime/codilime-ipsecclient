/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import { FC, useMemo } from 'react';
import { InputType } from 'interface/components';
import classNames from 'classnames';
import './styles.scss';

interface ComboBoxType extends InputType {
  edit: boolean;
  list: string;
  sourceInterface: { name: string }[] | [];
}

export const ComboBox: FC<ComboBoxType> = ({ type, placeholder, value, edit, name, list, onChange, sourceInterface = [] }) => {
  const displaySourceList = useMemo(
    () =>
      sourceInterface.map(({ name }) => (
        <option key={name} value={name}>
          {name}
        </option>
      )),
    [sourceInterface]
  );

  return (
    <>
      <input className={classNames('comboBox', { comboBox__active: edit })} {...{ type, name, placeholder, value, onChange, disabled: !edit, list }} />
      <datalist id={list}>{displaySourceList}</datalist>
    </>
  );
};
