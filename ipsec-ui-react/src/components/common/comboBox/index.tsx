import { FC } from 'react';
import classNames from 'classnames';
import { InputType } from 'interface/components';
import './styles.scss';

interface ComboBoxType extends InputType {
  edit: boolean;
  list: string;
  sourceList: string[] | [];
}

export const ComboBox: FC<ComboBoxType> = ({ type, placeholder, value, edit, name, list, onChange, sourceList }) => {
  const displaySourceList = sourceList.map((eachSource) => <option>{eachSource}</option>);

  return (
    <>
      <input className={classNames('comboBox', { comboBox__active: edit })} {...{ type, name, placeholder, value, onChange, disabled: !edit, list }} />
      <datalist id={list}>{displaySourceList}</datalist>
    </>
  );
};
