import { useRef, useState, useEffect, ChangeEvent, Dispatch, SetStateAction, RefObject } from 'react';
import { EndpointInput, Button, UploadCertificates } from 'common/';
import { AiFillCloseCircle } from 'react-icons/ai';
import classNames from 'classnames';
import { endpointsType } from 'interface/index';
import { decodeX509 } from 'utils/';


interface HookType {
  edit: boolean;
  error: any;
  setEndpoint: Dispatch<SetStateAction<endpointsType>>;
  endpoints: endpointsType;
}

export const useChoiceCertyficate = ({ edit, error, setEndpoint, endpoints }: HookType) => {
  const [fileName, setFileName] = useState({ key: 'Attach File', certificate: 'Attach File', peerCertificate: 'Attach File' });
  const {
    authentication: { type, psk, private_key, local_cert, remote_cert }
  } = endpoints;

  const key = useRef<HTMLInputElement>(null);
  const certificate = useRef<HTMLInputElement>(null);
  const peerCertificate = useRef<HTMLInputElement>(null);

  const handleUploadFile = (name: string) => {
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

  const handleChangeValueFile = (e: ChangeEvent<HTMLInputElement>, setEndpoint: Dispatch<SetStateAction<endpointsType>>, ref: RefObject<HTMLInputElement>) => {
    const { name } = e.target;

    if (!ref.current?.files) return;
    const reader = new FileReader();

    reader.onload = (e) => {
      setEndpoint((prev: endpointsType) => ({
        ...prev,
        authentication: {
          ...prev.authentication,
          psk: '',
          [name]: e.target?.result
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

  useEffect(() => {
    if (private_key) {
      setFileName((prev) => ({ ...prev, key: 'Private Key' }));
    }
    if (local_cert) {
      const CN = decodeX509(local_cert);
      if (CN) setFileName((prev) => ({ ...prev, certificate: CN }));
    }
    if (remote_cert) {
      const CN = decodeX509(remote_cert);
      setFileName((prev) => ({ ...prev, peerCertificate: CN }));
    }
  }, [private_key, local_cert, remote_cert]);

  const UploadCaSchema = [
    {
      type: 'file',
      name: 'private_key',
      label: 'key',
      text: fileName.key,
      edit,
      references: key,
      onChange: handleUpdateEndpoint,
      handleUploadFile
    },
    {
      type: 'file',
      name: 'local_cert',
      label: 'Certificate',
      text: fileName.certificate,
      edit,
      references: certificate,
      onChange: handleUpdateEndpoint,
      handleUploadFile
    },
    {
      type: 'file',
      name: 'remote_cert',
      label: 'Peer Certificate',
      text: fileName.peerCertificate,
      edit,
      references: peerCertificate,
      onChange: handleUpdateEndpoint,
      handleUploadFile
    }
  ];
  const displayCerts = UploadCaSchema.map((ca) => <UploadCertificates key={ca.name} {...ca} />);

  const handleGeneratePskField = (el: any) => {
    if (!type) {
      return (
        <td key={el.name} className={classNames('table__column', 'table__psk', 'table__psk__choice')}>
          <div className="table__center">
            <button className="table__psk__btn" onClick={() => handleChooseAuthentication('psk')}>
              Enter PSK
            </button>
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
          {displayCerts}
          {edit && <AiFillCloseCircle className="table__icon table__icon__change" onClick={() => handleChooseAuthentication('')} />}
        </td>
      );
    }
  };

  return { handleGeneratePskField };
};
