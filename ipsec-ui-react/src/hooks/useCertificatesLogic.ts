import { ChangeEvent, useRef } from 'react';
import { useAppContext } from 'hooks/';

export const useCertificatesLogic = () => {
  const { vrf, setVrf } = useAppContext();
  const { certificates } = vrf;
  const uploadBtn = useRef<HTMLInputElement>(null);
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
            const newCert: any = { name: file.name, commonName: '', value: e.target.result, time: '' };
            setVrf((prev) => ({ ...prev, certificates: [...prev.certificates, newCert] }));
          }
        };
      }
    }
  };

  return { certificates, uploadBtn, handleAddCerts, handleSaveNewCerts };
};
