import { FC } from 'react';
import { ButtonType } from 'interface/components';
import classNames from 'classnames';
import './styles.scss';

type ErrorProps = {
  local_cert: boolean;
  remote_cert: boolean;
  private_key: boolean;
  pkcs12_base64: boolean;
};

interface UploadButtonTypes extends ButtonType {
  name: string;
  edit: boolean;
  error?: keyof ErrorProps | any;
}

export const UploadButton: FC<UploadButtonTypes> = ({ onClick, children, name, edit, className = '', error }) => {
  console.log(error);
  return (
    <button {...{ onClick, name, disabled: !edit }} className={classNames('uploadButton', { uploadButton__disabled: !edit, [className]: className, uploadButton__error: error && error[name] })}>
      {children}
    </button>
  );
};
