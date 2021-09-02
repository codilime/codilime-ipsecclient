import React from 'react';
import { EndpointInput, UploadButton } from 'common';
import PropTypes from 'prop-types';

export const UploadCertificates = ({ type, name, onChange, edit, references, value, label, text, onClick, className }) => {
  return (
    <div className="table__certificates">
      <EndpointInput {...{ type, name, onChange, edit, references, value }} />
      {label && <p className="table__title">{label}</p>}
      <UploadButton {...{ onClick, name, edit, className }}>{text}</UploadButton>
    </div>
  );
};

UploadCertificates.propTypes = {
  type: PropTypes.string,
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  text: PropTypes.string,
  references: PropTypes.any,
  edit: PropTypes.bool,
  onChange: PropTypes.func,
  onClick: PropTypes.func,
  value: PropTypes.string,
  className: PropTypes.string
};
