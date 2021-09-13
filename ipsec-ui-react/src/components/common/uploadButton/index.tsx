import React, { FC } from 'react';
import classNames from 'classnames';
import './styles.scss';
import { ButtonTypeProps } from '../../../interface/components';

interface UploadButtonProps extends ButtonTypeProps {
  edit: boolean;
}

export const UploadButton: FC<UploadButtonProps> = ({ onClick, children, name, edit, className }) => {
  return (
    <button {...{ onClick, name, disabled: !edit }} className={classNames('uploadButton', { uploadButton__disabled: !edit, [className as any]: className })}>
      {children}
    </button>
  );
};
