import React, { FC, ChangeEvent, MouseEvent } from 'react';
import { Button } from 'common';

interface UploadCertificatesProps {
  references: any;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onClick?: (e: MouseEvent<HTMLInputElement>) => void;
}

export const UploadCertificates: FC<UploadCertificatesProps> = ({ references, onChange, onClick }) => {
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
