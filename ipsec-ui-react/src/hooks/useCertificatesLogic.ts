import { ChangeEvent, useRef, useState } from 'react';
import { useAppContext } from 'hooks/';
import { handleTakeTime, decodeX509 } from 'utils/';

interface dynamicObject {
  [key: string]: boolean;
}

export const useCertificatesLogic = () => {
  const { vrf, setVrf } = useAppContext();
  const { certificates } = vrf;
  const uploadBtn = useRef<HTMLInputElement>(null);
  const [checkedCa, setCheckedCa] = useState<dynamicObject>();

  const handleAddCerts = () => {
    if (uploadBtn.current) return uploadBtn.current.click();
  };

  const handleSaveNewCerts = (e: ChangeEvent<HTMLInputElement>) => {
    if (!uploadBtn.current) return;
    if (uploadBtn.current.files) {
      const uploadedFiles: any = uploadBtn.current.files;
      for (const file of uploadedFiles) {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = (e) => {
          if (e.target?.result) {
            const cert = e.target.result;
            console.log(cert);
            if (typeof cert === 'string') {
              const CN = decodeX509(cert);
              const newCert: any = { name: file.name, commonName: CN, value: e.target.result, time: handleTakeTime() };
              setCheckedCa((prev) => ({ ...prev, [file.name]: false }));
              setVrf((prev) => ({ ...prev, certificates: [...prev.certificates, newCert] }));
            }
          }
        };
      }
    }
  };

  const handleDeleteCerts = () => {
    if (!checkedCa) return;
    const newCert = certificates.filter((Cert) => {
      if (!checkedCa[Cert.name]) return Cert;
    });
    setVrf((prev) => ({ ...prev, certificates: [...newCert] }));
  };

  const handleCheckCerts = (e: ChangeEvent<HTMLInputElement>, name: string) => {
    setCheckedCa((prev) => ({ ...prev, [name]: e.target.checked }));
  };

  return { certificates, uploadBtn, handleAddCerts, handleSaveNewCerts, handleDeleteCerts, handleCheckCerts };
};
