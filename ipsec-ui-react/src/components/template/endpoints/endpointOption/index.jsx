import React from 'react';
import PropTypes from 'prop-types';
import { IoPencil, IoTrashBin } from 'react-icons/io5';
import classNames from 'classnames';
import './styles.scss';

export const EndpointOption = ({ open, handleToggleModal, handleActiveEdit, handleToggle }) => (
  <div className={classNames('endpointOption', { endpointOption__active: open })} onMouseLeave={handleToggle}>
    <ul>
      <li className="endpointOption__item" onClick={handleActiveEdit}>
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
  handleToggleModal: PropTypes.func,
  handleActiveEdit: PropTypes.func,
  handleToggle: PropTypes.func
};
