import { ChangeEvent, Ref, FC } from 'react';
import { Button } from 'common/';
import './styles.scss';
import classNames from 'classnames';

interface UploadCertificatesType {
  references: Ref<HTMLInputElement>;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onClick: () => void;
  handleDeleteCerts: () => void;
  noExistCerts: boolean;
  handleClose: () => void;
}

export const UploadCertificates: FC<UploadCertificatesType> = ({ references, onChange, onClick, handleDeleteCerts, handleClose, noExistCerts }) => (
  <div className={classNames('upload__wrapper', { upload__noCert: noExistCerts })}>
    <Button {...{ onClick: handleClose, className: 'upload__cancel' }}>Cancel</Button>
    {!noExistCerts && <Button {...{ onClick: handleDeleteCerts, className: 'upload__delete' }}>Delete Selected</Button>}
    <input {...{ type: 'file', name: 'uploadCerts', ref: references, onChange }} className="upload__input" multiple />
    <Button className={classNames('upload__button', { upload__noCert__button: noExistCerts })} {...{ onClick }}>
      Import Certificate
    </Button>
  </div>
);
