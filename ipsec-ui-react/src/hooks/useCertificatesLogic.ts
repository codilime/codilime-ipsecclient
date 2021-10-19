import { ChangeEvent, useRef, useState, useEffect } from 'react';
import { useAppContext } from 'hooks/';
import { client } from 'api/';

interface DynamicObject {
  [key: string]: boolean;
}

interface CertsType {
  CA: string;
}

export const useCertificatesLogic = () => {
  const { context, setContext } = useAppContext();
  const { certificates } = context;
  const uploadBtn = useRef<HTMLInputElement>(null);
  const [certs, setCerts] = useState<CertsType[]>([]);
  const [checkedCa, setCheckedCa] = useState<DynamicObject>();

  const handleAddCerts = () => {
    if (uploadBtn.current) return uploadBtn.current.click();
  };

  const handleUpdateCertsList = async () => {
    const newCerts = await client('cas');
    if (newCerts) setContext((prev) => ({ ...prev, certificates: [...newCerts] }));
  };

  useEffect(() => {
    if (certificates.length) {
      certificates.map((cert) => {
        if (cert.ID) setCheckedCa((prev) => ({ ...prev, [cert.ID!]: false }));
      });
    }
  }, [certificates]);

  const handleSaveNewCerts = (e: ChangeEvent<HTMLInputElement>) => {
    if (!uploadBtn.current) return;
    if (uploadBtn.current.files) {
      const uploadedFiles: any = uploadBtn.current.files;
      for (const file of uploadedFiles) {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = (e) => {
          if (e.target && e.target.result !== null) {
            const cert = e.target.result;
            if (typeof cert === 'string') {
              const newCert: any = { CA: e.target.result.toString() };
              setCerts((prev) => [...prev, newCert]);
            }
          }
        };
      }
    }
  };

  // useEffect(() => {
  //   if (certs.length) {
  //     const timeOut = setTimeout(async () => {
  //       await client('cas', [...certificates, ...certs], { method: 'POST' });
  //     }, 300);
  //     const UploadTimeout = setTimeout(async () => {
  //       handleUpdateCertsList();
  //     }, 500);
  //     return () => {
  //       clearTimeout(timeOut);
  //       clearTimeout(UploadTimeout);
  //     };
  //   }
  // }, [certs]);

  const handleDeleteCerts = async () => {
    if (!checkedCa) return;
    const newCert = certificates.filter((cert) => {
      if (cert.ID && !checkedCa[cert.ID]) return cert;
    });
    client('cas', [...newCert], { method: 'POST' });
    handleUpdateCertsList();
  };

  const handleCheckCerts = (e: ChangeEvent<HTMLInputElement>, name: number) => {
    setCheckedCa((prev) => ({ ...prev, [name]: e.target.checked }));
  };

  return { certificates, uploadBtn, handleAddCerts, handleSaveNewCerts, handleDeleteCerts, handleCheckCerts };
};
