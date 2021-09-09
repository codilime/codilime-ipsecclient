import React from 'react';
import { Wrapper, EachCertificate, UploadCertificates } from 'template';
import PropTypes from 'prop-types';
import { useCertificatesLogic } from 'hooks';
import './styles.scss';

export const SettingCertificates = () => {
  const { certificates, uploadBtn, handleAddCerts, handleSaveNewCerts } = useCertificatesLogic();

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

SettingCertificates.defaultProps = {
  certificates: [{ name: 'testName', commonName: 'test', time: '12.10.2021 19:21', checked: true }]
};

SettingCertificates.propTypes = {
  certificates: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      commonName: PropTypes.string,
      time: PropTypes.string,
      checked: PropTypes.bool,
      onChange: PropTypes.func
    })
  )
};
