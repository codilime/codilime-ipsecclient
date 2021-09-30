import { FC } from 'react';
import { validateDataInput } from 'utils/';
import { InputType } from 'interface/components';
import { ToolTipInfo } from 'common/';
import classNames from 'classnames';

interface VlanInput extends InputType {
  text: string;
  tooltip?: string;
  error?: boolean;
}

export const VlanInput: FC<VlanInput> = ({ text, type, name, placeholder, value, onChange, tooltip, error }) => (
  <div className="vlan__field">
    <label className="vlan__label">{text}</label>
    <input {...{ type, name, placeholder, className: classNames('vlan__input', { vlan__error: error, vlan__input__vlan: name === 'vlan' }), onKeyPress: validateDataInput, value, onChange }} />
    <ToolTipInfo {...{ error }}>{tooltip}</ToolTipInfo>
  </div>
);
