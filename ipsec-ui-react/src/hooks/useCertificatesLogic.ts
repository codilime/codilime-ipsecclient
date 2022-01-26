/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import { ChangeEvent, useRef, useState, useEffect } from 'react';
import { useAppContext } from 'hooks/';
import { client } from 'api/';

interface DynamicObject {
  [key: string]: boolean;
}

interface CertsType {
  id?: number;
  ca_file: string;
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
    const { ca } = await client('ca');
    if (ca) setContext((prev) => ({ ...prev, certificates: [...ca] }));
    setCerts([]);
  };

  useEffect(() => {
    if (certificates.length) {
      certificates.map((cert) => {
        if (cert.id) setCheckedCa((prev) => ({ ...prev, [cert.id]: false }));
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
              const newCert: CertsType = { ca_file: e.target.result.toString() };
              setCerts((prev) => [...prev, newCert]);
            }
          }
        };
      }
    }
  };

  useEffect(() => {
    if (certs.length) {
      const timeOut = setTimeout(async () => {
        const sortedCertificates = certificates.map(({ ca_file }, index) => ({
          id: index + 1,
          ca_file
        }));
        const newCerts = certs.map(({ ca_file }, index) => {

          return { id: certificates.length + index + 1, ca_file };
        });
        await client('ca', { ca: [...sortedCertificates, ...newCerts] }, { method: 'POST' });
      }, 300);
      const UploadTimeout = setTimeout(async () => {
        await handleUpdateCertsList();
      }, 500);
      return () => {
        clearTimeout(timeOut);
        clearTimeout(UploadTimeout);
      };
    }
  }, [certs]);

  const handleDeleteCerts = async () => {
    if (!checkedCa) return;
    const newCert = certificates.filter((cert) => {
      if (cert.id && !checkedCa[cert.id]) return cert;
    });
    await client('ca', { ca: [...newCert] }, { method: 'POST' });
    await handleUpdateCertsList();
  };

  const handleCheckCerts = (e: ChangeEvent<HTMLInputElement>, name: number | string) => {
    if (typeof name === 'string' && checkedCa) {
      const allChecked = Object.keys(checkedCa).reduce(
        (attr, key) => ({
          ...attr,
          [key]: checkedCa['all'] === true ? false : true
        }),
        {}
      );
      setCheckedCa(allChecked);
    }
    setCheckedCa((prev) => ({ ...prev, [name]: e.target.checked }));
  };

  return { certificates, uploadBtn, checkedCa, handleAddCerts, handleSaveNewCerts, handleDeleteCerts, handleCheckCerts };
};
