import { FC } from 'react';
import classNames from 'classnames';
import { ButtonType } from 'interface/components';
import './styles.scss';

interface UploadButtonTypes extends ButtonType {
  name: string;
  edit: boolean;
}

export const UploadButton: FC<UploadButtonTypes> = ({ onClick, children, name, edit, className = '' }) => {
  return (
    <button {...{ onClick, name, disabled: !edit }} className={classNames('uploadButton', { uploadButton__disabled: !edit, [className]: className })}>
      {children}
    </button>
  );
};
