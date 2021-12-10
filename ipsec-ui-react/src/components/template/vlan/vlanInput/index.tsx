import { FC } from 'react';
import { validateDataInput } from 'utils/';
import { InputType } from 'interface/components';
import { ToolTipInfo } from 'common/';
import classNames from 'classnames';

interface VlanInput extends InputType {
  text: string;
  tooltip?: string;
  error?: boolean;
  min?: string;
}

export const VlanInput: FC<VlanInput> = ({ text, type, name, placeholder, value, min, tooltip, error, onChange }) => (
  <div className="vlan__field">
    <label htmlFor={name} className="vlan__label">
      {text}
    </label>
    <input
      {...{
        id: name,
        type,
        name,
        placeholder,
        min,
        className: classNames('vlan__input', { vlan__error: error, vlan__input__vlan: name === 'vlan' }),
        value,
        onChange
      }}
    />
    <ToolTipInfo {...{ error }}>{tooltip}</ToolTipInfo>
  </div>
);
