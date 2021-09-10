import React, { FC, ChangeEvent } from 'react';
import { EndpointInput, UploadButton } from 'common/';
import PropTypes from 'prop-types';
import { InputType } from 'interface/components';

interface UploadCertificates extends InputType {
  edit: boolean;
  label: string;
  text: string;
  className?: string;
  handleUploadFile: (name: string) => void;
}

export const UploadCertificates: FC<UploadCertificates> = ({ type, name, onChange, edit, references, value, label, text, handleUploadFile, className = '' }) => {
  return (
    <div className="table__certificates">
      <EndpointInput {...{ type, name, onChange, edit, references, value }} />
      {label && <p className="table__title">{label}</p>}
      <UploadButton {...{ onClick: () => handleUploadFile(name), name, edit, className }}>{text}</UploadButton>
    </div>
  );
};
