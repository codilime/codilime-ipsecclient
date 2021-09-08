import React, { FC, ReactNode } from 'react';
import classNames from 'classnames';
import './styles.scss';

interface IUploadButton {
  onClick: () => void;
  children: ReactNode;
  name: string;
  className: string;
}

export const UploadButton: FC<IUploadButton> = ({ onClick, children, name, edit, className }) => {
  return (
    <button {...{ onClick, name, disabled: !edit }} className={classNames('uploadButton', { uploadButton__disabled: !edit, [className]: className })}>
      {children}
    </button>
  );
};
