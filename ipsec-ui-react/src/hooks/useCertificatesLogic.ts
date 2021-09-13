import { ChangeEvent, useContext, useRef, useState } from 'react';
import { VrfsContext } from 'context';

export const useCertificatesLogic = () => {
  const [loading, setLoading] = useState(false);
  const { vrf, setVrf } = useContext(VrfsContext);
  const { certificates } = vrf;
  const uploadBtn = useRef<HTMLInputElement>(null);
  const date = new Date();
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
