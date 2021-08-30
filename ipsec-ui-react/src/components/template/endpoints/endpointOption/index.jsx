import React from 'react';
import PropTypes from 'prop-types';
import { IoPencil, IoTrashBin } from 'react-icons/io5';
import { HiOutlineSwitchHorizontal } from 'react-icons/hi';
import './styles.scss';

export const EndpointOption = ({ open, handleToggleModal, handleActiveEdit, handleToggle, edit, handleChangePsk }) => (
  <div className={`endpointOption ${(open || edit) && 'endpointOption--active'}`} onMouseLeave={handleToggle}>
    <ul>
      <li className="endpointOption__item" onClick={handleActiveEdit}>
        <IoPencil className="endpointOption__icon" /> Edit
      </li>
      {edit && (
        <li className="endpointOption__item" onClick={() => handleChangePsk('reset')}>
          <HiOutlineSwitchHorizontal className="endpointOption__icon" /> Key
        </li>
      )}
      <li className="endpointOption__item endpointOption__delete " onClick={handleToggleModal}>
        <IoTrashBin className="endpointOption__icon" /> Delete
      </li>
    </ul>
  </div>
);

EndpointOption.propTypes = {
  open: PropTypes.bool,
  handleToggleModal: PropTypes.func,
  handleActiveEdit: PropTypes.func,
  handleToggle: PropTypes.func
};
