import React from 'react';
import PropTypes from 'prop-types';

export const EachCertificate = ({ name, commonName, time, checked, onChange }) => {
  return (
    <tr className="table__row">
      <td className="table__setting__column">{name}</td>
      <td className="table__setting__column">{commonName}</td>
      <td className="table__setting__column table__setting__time">{time}</td>
      <td className="table__setting__column table__setting__checked">
        <input {...{ type: 'checkbox', checked, onChange }} />
      </td>
    </tr>
  );
};

EachCertificate.propTypes = {
  name: PropTypes.string,
  commonName: PropTypes.string,
  time: PropTypes.element,
  checked: PropTypes.bool,
  onChange: PropTypes.func
};
