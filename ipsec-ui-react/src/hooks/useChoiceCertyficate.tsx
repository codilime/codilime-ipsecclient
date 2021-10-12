import { useRef, useState, useEffect, ChangeEvent, Dispatch, SetStateAction, RefObject } from 'react';
import { EndpointInput, Button, UploadCertificates } from 'common/';
import { AiFillCloseCircle } from 'react-icons/ai';
import classNames from 'classnames';
import { EndpointsType } from 'interface/index';
import { decodeX509 } from 'utils/';

interface HookType {
  edit: boolean;
  error: any;
  setEndpoint: Dispatch<SetStateAction<EndpointsType>>;
  endpoints: EndpointsType;
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
    switch (name) {
      case 'private_key':
        return key.current?.click();
      case 'local_cert':
        return certificate.current?.click();
      case 'remote_cert':
        return peerCertificate.current?.click();
      default:
        return;
    }
  };

  const handleChangeValueFile = (e: ChangeEvent<HTMLInputElement>, setEndpoint: Dispatch<SetStateAction<EndpointsType>>, ref: RefObject<HTMLInputElement>) => {
    const { name } = e.target;

    if (!ref.current?.files) return;
    const reader = new FileReader();

    reader.onload = (e) => {
      setEndpoint((prev: EndpointsType) => ({
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
    switch (name) {
      case 'psk':
        setFileName({ key: 'Attach File', certificate: 'Attach File', peerCertificate: 'Attach File' });
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
      case 'private_key':
        return handleChangeValueFile(e, setEndpoint, key);
      case 'local_cert':
        return handleChangeValueFile(e, setEndpoint, certificate);
      case 'remote_cert':
        return handleChangeValueFile(e, setEndpoint, peerCertificate);
      default:
        return;
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

  const handleUpdateFileName = () => {
    if (private_key) {
      setFileName((prev) => ({ ...prev, key: 'Private Key' }));
    }
    if (local_cert) {
      const decode = decodeX509(local_cert);
      if (decode) setFileName((prev) => ({ ...prev, certificate: decode.CN }));
    }
    if (remote_cert) {
      const decode = decodeX509(remote_cert);
      if (decode) setFileName((prev) => ({ ...prev, peerCertificate: decode.CN }));
    }
  };

  useEffect(() => {
    handleUpdateFileName();
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
    switch (type) {
      case 'psk':
        return (
          <td key={el.name} className={classNames('table__column', 'table__psk')}>
            <EndpointInput {...{ ...el, onChange: handleUpdateEndpoint, edit, error, value: psk }} />
            <div className="table__iconBox">{edit && <AiFillCloseCircle className="table__icon table__icon__change" onClick={() => handleChooseAuthentication('')} />}</div>
          </td>
        );
      case 'certs':
        return (
          <td key={el.name} className={classNames('table__column', 'table__psk', 'table__psk__choice')}>
            {displayCerts}
            {edit && <AiFillCloseCircle className="table__icon table__icon__change" onClick={() => handleChooseAuthentication('')} />}
          </td>
        );
      default:
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
  };

  return { handleGeneratePskField };
};
