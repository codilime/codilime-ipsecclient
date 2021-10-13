import { FC } from 'react';
import { Wrapper, EachCertificate, UploadCertificates } from 'template';
import { useCertificatesLogic } from 'hooks/';
import './styles.scss';

export const SettingCertificates: FC = () => {
  const { certificates, uploadBtn, handleAddCerts, handleSaveNewCerts, handleCheckCerts, handleDeleteCerts } = useCertificatesLogic();

  const displayCertificates = certificates.map(({ CA, ID }) => {
    if (ID !== undefined) {
      return <EachCertificate key={ID} {...{ CA, ID, handleCheckCerts: handleCheckCerts }} />;
    }
  });

  if (!certificates.length) {
    return (
      <>
        <Wrapper {...{ title: 'CA Certificates' }}>
          <div className="certificates__empty">The list of certificates is empty</div>
        </Wrapper>
        <UploadCertificates {...{ references: uploadBtn, onChange: handleSaveNewCerts, onClick: handleAddCerts, handleDeleteCerts }} />
      </>
    );
  }

  return (
    <div className="certificates">
      <Wrapper {...{ title: 'Certificates', className: 'certificates__wrapper' }}>
        <table className="table">
          <thead className="table__header">
            <tr className="table__row--header">
              <th className="table__setting__column">Organization Name</th>
              <th className="table__setting__column">Common Name</th>
              <th className="table__setting__column table__setting__checked"></th>
            </tr>
          </thead>
          <tbody className="table__body">{displayCertificates}</tbody>
        </table>
      </Wrapper>
      <UploadCertificates {...{ references: uploadBtn, onChange: handleSaveNewCerts, onClick: handleAddCerts, handleDeleteCerts }} />
    </div>
  );
};
