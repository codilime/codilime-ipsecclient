import React, { FC } from 'react';
import { Button } from 'common';

interface IUploadCertificates {
  references: any;
  onChange: () => void;
  onClick: () => void;
}

export const UploadCertificates: FC<IUploadCertificates> = ({ references, onChange, onClick }) => {
  return (
    <div className="certificates__box">
      <input {...{ type: 'file', name: 'uploadCerts', ref: references, onChange }} className="certificates__input" multiple />
      <Button className="certificates__button" {...{ onClick }}>
        Import Certificates
      </Button>
      <Button {...{ btnDelete: true }}>Delete checked</Button>
    </div>
  );
};
