import React from 'react';
import { IoPencil, IoTrashBin } from 'react-icons/io5';
import PropTypes from 'prop-types';
import './styles.scss';

export const EndpointOption = ({ open, handleToggleModal }) => (
  <div className={`endpointOption ${open ? 'endpointOption--active' : ''}`}>
    <ul>
      <li className="endpointOption__item">
        <IoPencil className="endpointOption__icon" /> Edit
      </li>
      <li className="endpointOption__item endpointOption__delete " onClick={handleToggleModal}>
        <IoTrashBin className="endpointOption__icon" /> Delete
      </li>
    </ul>
  </div>
);

EndpointOption.propTypes = {
  open: PropTypes.bool,
  handleToggleModal: PropTypes.func
};
