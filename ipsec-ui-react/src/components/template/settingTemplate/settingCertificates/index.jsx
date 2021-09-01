import React from 'react';
import { Wrapper } from 'template';
import { Button } from 'common';
import './styles.scss';

export const SettingCertificates = () => {
  return (
    <div className="certificates">
      <Wrapper {...{ title: 'Certificates' }}>
        <table className="table">
          <thead className="table__header">
            <tr className="table__row--header">
              <th className="table__setting__column">Common Name</th>
              <th className="table__setting__column table__setting__time">Time upload file</th>
              <th className="table__setting__column table__setting__checked"></th>
            </tr>
          </thead>
          <tbody className="table__body">
            <tr className="table__row">
              <td className="table__setting__column">Common name certificates</td>
              <td className="table__setting__column table__setting__time">25.10.2021 19:43</td>
              <td className="table__setting__column table__setting__checked">
                <input type="checkbox" />
              </td>
            </tr>
            <tr className="table__row">
              <td className="table__setting__column">Common name certificates</td>
              <td className="table__setting__column table__setting__time">25.10.2021 19:43</td>
              <td className="table__setting__column table__setting__checked">
                <input type="checkbox" />
              </td>
            </tr>
          </tbody>
        </table>
      </Wrapper>
      <div className="certificates_box">
        <Button className="certificates__button">Import Certificates</Button>
        <Button className="certificates__button" {...{ btnDelete: true }}>
          Delete checked
        </Button>
      </div>
    </div>
  );
};
