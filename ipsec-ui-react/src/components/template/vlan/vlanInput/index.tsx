/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import { FC } from 'react';
import { validateDataInput } from 'utils/';
import { InputType } from 'interface/components';
import { ToolTipInfo } from 'common/';
import classNames from 'classnames';

interface VlanInput extends InputType {
  tooltip?: string;
  error?: boolean;
  min?: string;
}

export const VlanInput: FC<VlanInput> = ({ type, name, placeholder, value, min, tooltip, error, onChange }) => (
  <div className="vlan__field">
    <input
      {...{
        id: name,
        type,
        name,
        placeholder,
        min,
        className: classNames('vlan__input', { vlan__error: error, vlan__input__vlan: name === 'vlan' }),
        value,
        onChange,
        onKeyPress: validateDataInput
      }}
    />
    <ToolTipInfo {...{ error }}>{tooltip}</ToolTipInfo>
  </div>
);
