import { useContext, useRef, useState } from 'react';
import { VrfsContext } from 'context';
import TimeStamp from 'react-timestamp';

export const useCertificatesLogic = () => {
  const [loading, setLoading] = useState(false);
  const { vrf, setVrf } = useContext(VrfsContext);
  const { certificates } = vrf;
  const uploadBtn = useRef(null);
  const date = new Date();
  const handleAddCerts = () => {
    if (uploadBtn.current) return uploadBtn.current.click();
  };

  const handleSaveNewCerts = (e) => {
    if (uploadBtn.current.files) {
      setLoading(true);
      const uploadedFiles = uploadBtn.current.files;
      if (!uploadedFiles.length) return;
      for (const file of uploadedFiles) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target.result) {
            const newCert = { name: file.name, commonName: '', value: e.target.result, time: <TimeStamp relative date={date} autoUpdate /> };
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
