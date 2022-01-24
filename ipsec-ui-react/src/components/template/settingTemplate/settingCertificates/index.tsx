import { FC } from 'react';
import { EachCertificate, UploadCertificates, HoverPanel } from 'template';
import { useCertificatesLogic } from 'hooks/';
import classNames from 'classnames';
import './styles.scss';

interface SettingCertificatesType {
  handleClose: () => void;
}

export const SettingCertificates: FC<SettingCertificatesType> = ({ handleClose }) => {
  const { certificates, uploadBtn, checkedCa, handleAddCerts, handleSaveNewCerts, handleCheckCerts, handleDeleteCerts } = useCertificatesLogic();

  const displayCertificates = certificates.map(({ ca_file, id }) => {
    if (id !== undefined && checkedCa !== undefined) return <EachCertificate key={id} {...{ ca_file, id, handleCheckCerts: handleCheckCerts, checkedCa }} />;
  });

  return (
    <div className="certificates">
      <div className={classNames('certificates__wrapper', { certificates__active: certificates.length })}>
        <table className="table">
          <thead className="table__header">
            <tr className="table__row--header">
              <th className="table__setting__header">Organization Name</th>
              <th className="table__setting__header">Common Name</th>
              <th className="table__setting__header table__setting__checked">
                <input {...{ type: 'checkbox', className: 'table__setting__checkbox', onChange: (e) => handleCheckCerts(e, 'all') }} />
              </th>
            </tr>
          </thead>
          <tbody className="table__body">{displayCertificates}</tbody>
        </table>
      </div>
      <HoverPanel
        {...{
          title: 'The list of certificates is empty',
          description: { result: 'default', message: 'The list of certificates is empty' },
          active: !certificates.length
        }}
      />
      <UploadCertificates {...{ references: uploadBtn, onChange: handleSaveNewCerts, onClick: handleAddCerts, handleDeleteCerts, noExistCerts: !certificates.length, handleClose }} />
    </div>
  );
};
