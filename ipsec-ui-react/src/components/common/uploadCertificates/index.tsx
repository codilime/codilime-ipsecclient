import { FC } from 'react';
import { EndpointInput, UploadButton } from 'common/';
import { InputType } from 'interface/components';
import classNames from 'classnames';

interface UploadCertificates extends InputType {
  edit: boolean;
  label: string;
  text: string;
  className?: string;
  handleUploadFile: (name: string) => void;
  error?: any;
}

export const UploadCertificates: FC<UploadCertificates> = ({ type, name, onChange, edit, references, value, label, text, handleUploadFile, className = '', error }) => (
  <div className={classNames('table__certificates', { [className]: className })}>
    <EndpointInput {...{ type, name, onChange, edit, references, value }} />
    {label && <p className="table__title">{label}</p>}
    <UploadButton {...{ onClick: () => handleUploadFile(name), name, edit, error }}>{text}</UploadButton>
  </div>
);
