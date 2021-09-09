import React, { FC, MouseEvent } from 'react';
import classNames from 'classnames';
import './styles.scss';

interface IUploadButton {
  name: string;
  className: string;
  edit: boolean;
  onClick?: (e: MouseEvent<HTMLInputElement>) => void;
}

export const UploadButton: FC<IUploadButton> = ({ onClick, children, name, edit, className }) => {
  return (
    <button {...{ onClick, name, disabled: !edit }} className={classNames('uploadButton', { uploadButton__disabled: !edit, [className]: className })}>
      {children}
    </button>
  );
};
