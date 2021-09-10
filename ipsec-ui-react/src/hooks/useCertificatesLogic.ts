import { ChangeEvent, useContext, useRef, useState } from 'react';
import { VrfsContext } from 'context';
import { useAppContext } from 'hooks/';

export const useCertificatesLogic = () => {
  const [loading, setLoading] = useState(false);
  const { AppContext } = useAppContext();
  const { vrf, setVrf } = AppContext();
  const { certificates } = vrf;
  const uploadBtn = useRef<HTMLInputElement>(null);
  const date = new Date();
  const handleAddCerts = () => {
    if (uploadBtn.current) return uploadBtn.current.click();
  };

  const handleSaveNewCerts = (e: ChangeEvent<HTMLInputElement>) => {
    if (!uploadBtn.current) return;
    if (uploadBtn.current.files) {
      setLoading(true);
      const uploadedFiles: any = uploadBtn.current.files;
      for (const file of uploadedFiles) {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = (e) => {
          if (e.target?.result) {
            const newCert: any = { name: file.name, commonName: '', value: e.target.result, time: '' };
            setVrf((prev) => ({ ...prev, certificates: [...prev.certificates, newCert] }));
          }
        };
      }
      setLoading(false);
    }
  };

  return { certificates, uploadBtn, handleAddCerts, handleSaveNewCerts };
};
