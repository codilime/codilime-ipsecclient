import React, { ChangeEvent, MouseEvent, FC } from 'react';
import { EndpointInput, UploadButton } from 'common';

interface UploadCertificatesProps {
  name: string;
  type?: string;
  label?: string;
  text?: string;
  references?: any;
  edit?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onClick?: (e: MouseEvent<HTMLInputElement>) => void;
  value?: string;
  className?: string;
}

export const UploadCertificates: FC<UploadCertificatesProps> = ({ type, name, onChange, edit, references, value, label, text, onClick, className }) => {
  return (
    <div className="table__certificates">
      <EndpointInput {...{ type, name, onChange, edit, references, value }} />
      {label && <p className="table__title">{label}</p>}
      <UploadButton {...{ onClick, name, edit, className }}>{text}</UploadButton>
    </div>
  );
};
