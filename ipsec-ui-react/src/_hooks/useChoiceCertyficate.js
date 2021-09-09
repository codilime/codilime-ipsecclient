import React, { useRef, useState, useEffect } from 'react';
import { EndpointInput, Button, UploadCertificates } from 'common';
import { AiFillCloseCircle } from 'react-icons/ai';
import classNames from 'classnames';

export const useChoiceCertyficate = (edit, error, setEndpoint, endpoints) => {
  const [fileName, setFileName] = useState({ key: 'Attach File', certificate: 'Attach File', peerCertificate: 'Attach File' });
  const {
    authentication: { type, psk, private_key, local_cert, remote_cert }
  } = endpoints;

  useEffect(() => {
    if (private_key) {
      setFileName((prev) => ({ ...prev, key: 'Complate' }));
    }
    if (local_cert) {
      setFileName((prev) => ({ ...prev, certificate: 'Complate' }));
    }
    if (remote_cert) {
      setFileName((prev) => ({ ...prev, peerCertificate: 'Complate' }));
    }
  }, [endpoints]);

  const key = useRef(null);
  const certificate = useRef(null);
  const peerCertificate = useRef(null);

  const handleUploadFile = (e) => {
    const { name } = e.target;
    if (name === null) {
      return;
    }
    if (name === 'private_key') {
      return key.current?.click();
    }
    if (name === 'local_cert') {
      return certificate.current?.click();
    }
    if (name === 'remote_cert') {
      return peerCertificate.current?.click();
    }
  };

  const handleChangeValueFile = (e, setEndpoint, ref) => {
    const { name } = e.target;
    if (!ref.current.files) return;
    const reader = new FileReader();

    reader.onload = (e) => {
      setEndpoint((prev) => ({
        ...prev,
        authentication: {
          ...prev.authentication,
          psk: '',
          [name]: e.target.result
        }
      }));
    };
    reader.readAsText(ref.current.files[0]);
  };

  const handleUpdateEndpoint = (e) => {
    const { name, value } = e.target;
    if (name === 'psk') {
      setFileName({ key: '', certificate: '', peerCertificate: '' });
      return setEndpoint((prev) => ({
        ...prev,
        authentication: {
          ...prev.authentication,
          private_key: '',
          local_cert: '',
          remote_cert: '',
          [name]: value
        }
      }));
    }
    if (name === 'private_key') {
      key.current?.files && setFileName((prev) => ({ ...prev, key: 'Complete' }));
      return handleChangeValueFile(e, setEndpoint, key);
    }
    if (name === 'local_cert') {
      certificate.current?.files && setFileName((prev) => ({ ...prev, certificate: 'Complete' }));

      return handleChangeValueFile(e, setEndpoint, certificate);
    }
    if (name === 'remote_cert') {
      peerCertificate.current?.files && setFileName((prev) => ({ ...prev, peerCertificate: 'Complete' }));
      return handleChangeValueFile(e, setEndpoint, peerCertificate);
    }
  };

  const handleChooseAuthentication = (name) => {
    return setEndpoint((prev) => ({
      ...prev,
      authentication: {
        ...prev.authentication,
        type: name
      }
    }));
  };

  const handleGeneratePskField = (el) => {
    if (!type) {
      return (
        <td key={el.name} className={classNames('table__column', 'table__psk', 'table__psk__choice')}>
          <div className="table__center" onClick={() => handleChooseAuthentication('psk')}>
            <EndpointInput {...{ ...el, error }} />
          </div>
          <span className="table__text">or</span>
          <div className="table__center">
            <Button className="table__btn" onClick={() => handleChooseAuthentication('certs')}>
              X509
            </Button>
          </div>
        </td>
      );
    }
    if (type === 'psk') {
      return (
        <td key={el.name} className={classNames('table__column', 'table__psk')}>
          <EndpointInput {...{ ...el, onChange: handleUpdateEndpoint, edit, error, value: psk }} />
          <div className="table__iconBox">{edit && <AiFillCloseCircle className="table__icon table__icon__change" onClick={() => handleChooseAuthentication('')} />}</div>
        </td>
      );
    }
    if (type === 'certs') {
      return (
        <td key={el.name} className={classNames('table__column', 'table__psk', 'table__psk__choice')}>
          <UploadCertificates
            {...{
              type: 'file',
              name: 'private_key',
              label: 'key',
              text: fileName.key,
              edit,
              references: key,
              onChange: handleUpdateEndpoint,
              onClick: handleUploadFile
            }}
          />
          <UploadCertificates
            {...{
              type: 'file',
              name: 'local_cert',
              label: 'Certificate',
              text: fileName.certificate,
              edit,
              references: certificate,
              onChange: handleUpdateEndpoint,
              onClick: handleUploadFile
            }}
          />
          <UploadCertificates
            {...{
              type: 'file',
              name: 'remote_cert',
              label: 'Peer Certificate',
              text: fileName.peerCertificate,
              edit,
              references: peerCertificate,
              onChange: handleUpdateEndpoint,
              onClick: handleUploadFile
            }}
          />

          {edit && <AiFillCloseCircle className="table__icon table__icon__change" onClick={() => handleChooseAuthentication('')} />}
        </td>
      );
    }
  };

  return { handleGeneratePskField };
};
