import { useRef, useState, useEffect, ChangeEvent, Dispatch, SetStateAction, RefObject } from 'react';
import { EndpointInput, UploadCertificates } from 'common/';
import { AiFillCloseCircle } from 'react-icons/ai';
import classNames from 'classnames';
import { EndpointsType } from 'interface/index';
import { useVrfLogic } from 'hooks/';
import { decodeX509, pkcs12ToBase64 } from 'utils/';
import { AiOutlineUpload } from 'react-icons/ai';
interface HookType {
  edit: boolean;
  error: any;
  setEndpoint: Dispatch<SetStateAction<EndpointsType>>;
  endpoints: EndpointsType;
}

interface fileNameType {
  key: string;
  certificate: string;
  peerCertificate: string;
  pkcs12_base64: string;
}

export const useChoiceCertyficate = ({ edit, error, setEndpoint, endpoints }: HookType) => {
  const [fileName, setFileName] = useState<fileNameType>({ key: 'Attach File', certificate: 'Attach File', peerCertificate: 'Attach File', pkcs12_base64: 'Attach File' });
  const {
    authentication: { type, psk, private_key, local_cert, remote_cert, pkcs12_base64 }
  } = endpoints;
  const { hardware } = useVrfLogic();

  const key = useRef<HTMLInputElement>(null);
  const certificate = useRef<HTMLInputElement>(null);
  const peerCertificate = useRef<HTMLInputElement>(null);
  const pkcs12 = useRef<HTMLInputElement>(null);

  const handleUploadFile = (name: string) => {
    switch (name) {
      case 'private_key':
        return key.current?.click();
      case 'local_cert':
        return certificate.current?.click();
      case 'remote_cert':
        return peerCertificate.current?.click();
      case 'pkcs12_base64':
        return pkcs12.current?.click();
      default:
        return;
    }
  };

  const handleChangeValueFile = (e: ChangeEvent<HTMLInputElement>, setEndpoint: Dispatch<SetStateAction<EndpointsType>>, ref: RefObject<HTMLInputElement>) => {
    const { name } = e.target;

    if (!ref.current?.files) return;
    const reader = new FileReader();
    if (name !== 'pkcs12_base64')
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
    if (name === 'pkcs12_base64') {
      reader.onload = (e) => {
        const base64 = pkcs12ToBase64(e.target?.result);
        setEndpoint((prev: EndpointsType) => ({
          ...prev,
          authentication: {
            ...prev.authentication,
            psk: '',
            [name]: base64
          }
        }));
      };
      reader.readAsBinaryString(ref.current.files[0]);
    }
  };

  const handleUpdateEndpoint = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (hardware) {
      switch (name) {
        case 'psk':
          if (type === 'certs') {
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
          } else {
            setFileName((prev) => ({ ...prev, pkcs12_base64: 'Attach File' }));
            return setEndpoint((prev) => ({
              ...prev,
              authentication: {
                ...prev.authentication,
                private_key: '',
                local_cert: '',
                remote_cert: '',
                pkcs12_base64: '',
                [name]: value
              }
            }));
          }
        case 'pkcs12_base64':
          return handleChangeValueFile(e, setEndpoint, pkcs12);
        default:
          return;
      }
    } else
      switch (name) {
        case 'psk':
          setFileName((prev) => ({ ...prev, key: 'Attach File', certificate: 'Attach File', peerCertificate: 'Attach File' }));
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
        case 'pkcs12_base64':
          return handleChangeValueFile(e, setEndpoint, pkcs12);
        default:
          return;
      }
  };

  const handleChooseAuthentication = (name: string) => {
    return setEndpoint((prev) => ({
      ...prev,
      authentication: {
        ...prev.authentication,
        psk: '',
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
    if (pkcs12_base64) {
      setFileName((prev) => ({ ...prev, pkcs12_base64: 'Complete' }));
    }
  };

  useEffect(() => {
    handleUpdateFileName();
  }, [private_key, local_cert, remote_cert, pkcs12_base64]);

  const UploadCaSchema = [
    {
      type: 'file',
      name: 'private_key',
      label: 'key',
      text: fileName.key,
      edit,
      error,
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
      error,
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
      error,
      references: peerCertificate,
      onChange: handleUpdateEndpoint,
      handleUploadFile
    }
  ];

  const displayCerts = UploadCaSchema.map((ca) => <UploadCertificates key={ca.name} {...ca} />);

  const initOptions = (el: any) => {
    return (
      <td key={el.name} className={classNames('table__column', 'table__psk', 'table__psk__choice')}>
        <div className="table__center">
          <button className={classNames('table__psk__btn', { table__btn__error: error['psk'] })} onClick={() => handleChooseAuthentication('psk')}>
            PSK
          </button>
        </div>
        <span className="table__text">or</span>
        <div className="table__center">
          <button className={classNames('table__psk__btn', { table__btn__error: error['psk'] })} onClick={() => handleChooseAuthentication('certs')}>
            X509 <AiOutlineUpload className="table__upload" />
          </button>
        </div>
      </td>
    );
  };

  const initPskOption = (el: any) => {
    return (
      <td key={el.name} className={classNames('table__column', 'table__psk')}>
        <EndpointInput {...{ ...el, onChange: handleUpdateEndpoint, edit, error, value: psk }} />
        <div className="table__iconBox">{edit && <AiFillCloseCircle className="table__icon table__icon__change" onClick={() => handleChooseAuthentication('')} />}</div>
      </td>
    );
  };

  const initCertsOption = (el: any) => {
    if (hardware) {
      return (
        <td key={el.name} className={classNames('table__column', 'table__psk', 'table__psk__choice')}>
          <UploadCertificates
            {...{
              key: el.name,
              type: 'file',
              name: 'pkcs12_base64',
              label: 'Password',
              text: fileName.pkcs12_base64,
              edit,
              references: pkcs12,
              onChange: handleUpdateEndpoint,
              handleUploadFile,
              error,
              className: 'table__certificates__hardware'
            }}
          />
          <EndpointInput {...{ ...el, onChange: handleUpdateEndpoint, edit, error, value: psk, hardware }} />
          {edit && <AiFillCloseCircle className="table__icon table__icon__change" onClick={() => handleChooseAuthentication('')} />}
        </td>
      );
    } else
      return (
        <td key={el.name} className={classNames('table__column', 'table__psk', 'table__psk__choice')}>
          {displayCerts}
          {edit && <AiFillCloseCircle className="table__icon table__icon__change" onClick={() => handleChooseAuthentication('')} />}
        </td>
      );
  };

  const handleGeneratePskField = (el: any) => {
    switch (type) {
      case 'psk':
        return initPskOption(el);
      case 'certs':
        return initCertsOption(el);
      default:
        return initOptions(el);
    }
  };

  return { handleGeneratePskField };
};
