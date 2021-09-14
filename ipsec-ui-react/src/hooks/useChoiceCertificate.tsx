import React, { useRef, useState, useEffect, Dispatch, SetStateAction, ChangeEvent, Ref } from 'react';
import { EndpointInput, Button, UploadCertificates } from 'common/';
import { AiFillCloseCircle } from 'react-icons/ai';
import classNames from 'classnames';
import { endpointAuthentication, endpointTypes } from '../interface/components';

interface ChoiceCertificateProps {
  edit: boolean;
  error: any;
  setEndpoint: Dispatch<SetStateAction<endpointTypes>>;
  endpoints: {
    authentication: endpointAuthentication;
  };
}

export const useChoiceCertificate = (...{ edit, error, setEndpoint, endpoints }: ChoiceCertificateProps) => {
  const [fileName, setFileName] = useState({ key: 'Attach File', certificate: 'Attach File', peerCertificate: 'Attach File' });
  const {
    authentication: { type, psk, private_key, local_cert, remote_cert }
  } = endpoints;

  useEffect(() => {
    if (private_key) {
      setFileName((prev) => ({ ...prev, key: 'Complete' }));
    }
    if (local_cert) {
      setFileName((prev) => ({ ...prev, certificate: 'Complete' }));
    }
    if (remote_cert) {
      setFileName((prev) => ({ ...prev, peerCertificate: 'Complete' }));
    }
  }, [endpoints]);

  const key = useRef<HTMLInputElement>(null);
  const certificate = useRef<HTMLInputElement>(null);
  const peerCertificate = useRef<HTMLInputElement>(null);

  const handleUploadFile = (e: ChangeEvent<HTMLInputElement>) => {
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

  // interface handleChangeValueFileTypes {
  //   e: ChangeEvent<HTMLInputElement>;
  //   setEndpoint: Dispatch<SetStateAction<endpointTypes>>;
  //   ref: Ref<HTMLInputElement>;
  // }

  const handleChangeValueFile = (e: ChangeEvent<HTMLInputElement>, setEndpoint: Dispatch<SetStateAction<endpointTypes>>, ref: any) => {
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

  const handleUpdateEndpoint = (e: ChangeEvent<HTMLInputElement>) => {
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

  const handleChooseAuthentication = (name: string) => {
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
            <Button name="" className="table__btn" onClick={() => handleChooseAuthentication('certs')}>
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
