import React, { FC } from 'react';
import { Wrapper, EachCertificate, UploadCertificates } from 'template';
import { useCertificatesLogic } from 'hooks';
import './styles.scss';

interface ISettingCertificates {
  certificates: Array<{ name: string; commonName: string; time: string; checked: boolean; onChange: () => void }>;
}

export const SettingCertificates: FC<ISettingCertificates> = () => {
  const { certificates = [{ name: 'testName', commonName: 'test', time: '12.10.2021 19:21', checked: true }], uploadBtn, handleAddCerts, handleSaveNewCerts } = useCertificatesLogic();

  const displayCertificates = certificates.map((certificate) => <EachCertificate key={certificate.name} {...certificate} />);

  if (!certificates.length) {
    return (
      <>
        <Wrapper {...{ title: 'Certificates' }}>
          <div className="certificates__empty">The list of certificates is empty</div>
        </Wrapper>
        <UploadCertificates {...{ references: uploadBtn, onChange: handleSaveNewCerts, onClick: handleAddCerts }} />
      </>
    );
  }

  return (
    <div className="certificates">
      <Wrapper {...{ title: 'Certificates', className: 'certificates__wrapper' }}>
        <table className="table">
          <thead className="table__header">
            <tr className="table__row--header">
              <th className="table__setting__column">File Name</th>
              <th className="table__setting__column">Common Name</th>
              <th className="table__setting__column table__setting__time">Time upload file</th>
              <th className="table__setting__column table__setting__checked"></th>
            </tr>
          </thead>
          <tbody className="table__body">{displayCertificates}</tbody>
        </table>
      </Wrapper>
      <UploadCertificates {...{ references: uploadBtn, onChange: handleSaveNewCerts, onClick: handleAddCerts }} />
    </div>
  );
};
