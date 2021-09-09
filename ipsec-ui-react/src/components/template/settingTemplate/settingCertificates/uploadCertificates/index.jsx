import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'common';

export const UploadCertificates = ({ references, onChange, onClick }) => {
  return (
    <div className="certificates__box">
      <input {...{ type: 'file', name: 'uploadCerts', ref: references, onChange }} className="certificates__input" multiple />
      <Button className="certificates__button" {...{ onClick }}>
        Import Certificates
      </Button>
      <Button className="certificates__button" {...{ btnDelete: true }}>
        Delete checked
      </Button>
    </div>
  );
};

UploadCertificates.propTypes = {
  references: PropTypes.any,
  onChange: PropTypes.func,
  onClick: PropTypes.func
};
