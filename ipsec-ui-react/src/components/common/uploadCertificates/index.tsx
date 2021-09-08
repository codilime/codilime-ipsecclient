import React, { FC } from 'react';
import { EndpointInput, UploadButton } from 'common';

interface IUploadCertificates {
  type?: string;
  name: string;
  label?: string;
  text?: string;
  references?: any;
  edit?: boolean;
  onChange?: () => void;
  onClick?: () => void;
  value?: string;
  className?: string;
}

export const UploadCertificates: FC<IUploadCertificates> = ({ type, name, onChange, edit, references, value, label, text, onClick, className }) => {
  return (
    <div className="table__certificates">
      <EndpointInput {...{ type, name, onChange, edit, references, value }} />
      {label && <p className="table__title">{label}</p>}
      <UploadButton {...{ onClick, name, edit, className }}>{text}</UploadButton>
    </div>
  );
};
