import { ChangeEvent, Ref, FC } from 'react';
import { Button } from 'common/';

interface uploadCertificatesType {
  references: Ref<HTMLInputElement>;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onClick: () => void;
  handleDeleteCerts: () => void;
}

export const UploadCertificates: FC<uploadCertificatesType> = ({ references, onChange, onClick, handleDeleteCerts }) => {
  return (
    <div className="certificates__box">
      <input {...{ type: 'file', name: 'uploadCerts', ref: references, onChange }} className="certificates__input" multiple />
      <Button className="certificates__button" {...{ onClick }}>
        Import Certificates
      </Button>
      <Button {...{ btnDelete: true, onClick: handleDeleteCerts }}>Delete checked</Button>
    </div>
  );
};
