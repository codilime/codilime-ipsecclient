import React, { useRef, useState } from 'react';
import classNames from 'classnames';
import { EndpointInput, UploadButton, Button } from 'common';
import { AiFillCloseCircle } from 'react-icons/ai';

export const useChoiceCertyficate = (edit, onChange, error, handleChangePsk, schema, setEndpoint, endpoints) => {
  const [certyficate, setCertyficate] = useState({ key: '', certificate: '', peerCertificate: '' });

  const key = useRef(null);
  const certificate = useRef(null);
  const peerCertificate = useRef(null);

  const handleUploadFile = (e) => {
    const { name } = e.target;
    if (name === null) {
      return;
    }
    if (name === 'key') {
      return key.current?.click();
    }
    if (name === 'certificate') {
      return certificate.current?.click();
    }
    if (name === 'peerCertificate') {
      return peerCertificate.current?.click();
    }
  };

  const handleAddFile = (e) => {
    const { name } = e.target;
    if (name === 'key') {
      key.current?.files && setCertyficate((prev) => ({ ...prev, key: key.current.files[0].name }));
      return setEndpoint((prev) => ({
        ...prev,
        [name]: key.current.files[0]
      }));
    }
    if (name === 'certificate') {
      certificate.current?.files && setCertyficate((prev) => ({ ...prev, certificate: certificate.current.files[0].name }));
      return setEndpoint((prev) => ({
        ...prev,
        [name]: certificate.current.files[0]
      }));
    }
    if (name === 'peerCertificate') {
      peerCertificate.current?.files && setCertyficate((prev) => ({ ...prev, peerCertificate: peerCertificate.current.files[0].name }));
      return setEndpoint((prev) => ({
        ...prev,
        [name]: peerCertificate.current.files[0]
      }));
    }
  };

  const handleGeneratePskField = (el) => {
    if (!schema.psk && !schema.certificates) {
      return (
        <td key={el.name} className={classNames('table__column', 'table__psk', 'table__psk__choice')}>
          <div className="table__center" onClick={() => handleChangePsk('psk')}>
            <EndpointInput {...{ ...el, edit, error }} />
          </div>
          <span className="table__text">or</span>
          <div className="table__center">
            <Button className="table__btn" onClick={handleChangePsk}>
              X509
            </Button>
          </div>
        </td>
      );
    }
    if (schema.psk) {
      return (
        <td key={el.name} className={classNames('table__column', 'table__psk')}>
          <EndpointInput {...{ ...el, onChange, edit, error }} />
          <div className='table__iconBox'>
            <AiFillCloseCircle className="table__icon" onClick={() => handleChangePsk('reset')} />
          </div>
        </td>
      );
    }
    if (schema.certificates) {
      return (
        <td key={el.name} className={classNames('table__column', 'table__psk', 'table__psk__choice')}>
          <div className="table__certificates">
            <EndpointInput {...{ type: 'file', name: 'key', onChange: handleAddFile, edit, error, references: key, value: endpoints.key }} />
            <p className="table__title">Key:</p>
            <UploadButton {...{ onClick: handleUploadFile, name: 'key', edit }}>{certyficate.key ? certyficate.key : 'Attach File'}</UploadButton>
          </div>
          <div className="table__certificates">
            <EndpointInput {...{ type: 'file', name: 'certificate', onChange: handleAddFile, edit, error, references: certificate, value: endpoints.certificate }} />
            <p className="table__title">Certificate:</p>
            <UploadButton {...{ onClick: handleUploadFile, name: 'certificate', edit }}>{certyficate.certificate ? certyficate.certificate : 'Attach File'}</UploadButton>
          </div>
          <div className="table__certificates">
            <EndpointInput {...{ type: 'file', name: 'peerCertificate', onChange: handleAddFile, edit, error, references: peerCertificate, value: endpoints.peerCertificate }} />
            <p className="table__title">Peer Certificate:</p>
            <UploadButton {...{ onClick: handleUploadFile, name: 'peerCertificate', edit }}>{certyficate.peerCertificate ? certyficate.peerCertificate : 'Attach File'}</UploadButton>
          </div>
          <AiFillCloseCircle className="table__icon" onClick={() => handleChangePsk('reset')} />
        </td>
      );
    }
  };

  return { handleGeneratePskField, handleAddFile };
};
