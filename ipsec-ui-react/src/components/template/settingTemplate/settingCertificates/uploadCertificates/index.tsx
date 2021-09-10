import React, { FC, ChangeEvent, MouseEvent, Ref } from 'react';
import { Button } from 'common/';

interface UploadCertificatesProps {
  references: Ref<any>;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
}

export const UploadCertificates: FC<UploadCertificatesProps> = ({ references, onChange, onClick }) => {
  return (
    <div className="certificates__box">
      <input {...{ type: 'file', name: 'uploadCerts', ref: references, onChange }} className="certificates__input" multiple />
      <Button name="" className="certificates__button" {...{ onClick }}>
        Import Certificates
      </Button>
      <Button name="" {...{ btnDelete: true }}>
        Delete checked
      </Button>
    </div>
  );
};
