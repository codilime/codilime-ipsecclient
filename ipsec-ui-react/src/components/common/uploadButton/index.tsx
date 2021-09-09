import React, { FC } from 'react';
import classNames from 'classnames';
import './styles.scss';

interface IUploadButton {
  onClick: () => void;
  name: string;
  className: string;
  edit: boolean;
}

export const UploadButton: FC<IUploadButton> = ({ onClick, children, name, edit, className }) => {
  return (
    <button {...{ onClick, name, disabled: !edit }} className={classNames('uploadButton', { uploadButton__disabled: !edit, [className]: className })}>
      {children}
    </button>
  );
};
