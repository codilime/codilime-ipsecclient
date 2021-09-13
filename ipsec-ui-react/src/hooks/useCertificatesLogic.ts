import { ChangeEvent, useRef, useState } from 'react';
import { useGetContextValues } from './useGetContextValues';

export const useCertificatesLogic = () => {
  const [loading, setLoading] = useState(false);
  const { vrf, setVrf } = useGetContextValues();
  const { certificates } = vrf;
  const uploadBtn = useRef<HTMLInputElement>(null);
  const handleAddCerts = () => {
    if (uploadBtn.current) return uploadBtn.current.click();
  };

  const handleSaveNewCerts = (e: ChangeEvent<HTMLInputElement>) => {
    if (uploadBtn.current && uploadBtn.current.files) {
      setLoading(true);
      const uploadedFiles: any = uploadBtn.current.files;
      for (const file of uploadedFiles) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target && e.target.result) {
            const newCert = { name: file.name, commonName: '', value: e.target.result, time: '' };
            setVrf((prev) => ({ ...prev, certificates: [...prev.certificates, newCert] }));
          }
        };
        reader.readAsText(file);
      }
      setLoading(false);
    }
  };

  return { certificates, uploadBtn, handleAddCerts, handleSaveNewCerts };
};
