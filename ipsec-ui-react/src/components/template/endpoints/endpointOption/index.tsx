import React, { FC } from 'react';
import { IoPencil, IoTrashBin } from 'react-icons/io5';
import classNames from 'classnames';
import './styles.scss';

interface IEndpointOption {
  open: boolean;
  handleToggleModal: () => void;
  handleActiveEdit: () => void;
  handleToggle: () => void;
}

export const EndpointOption: FC<IEndpointOption> = ({ open, handleToggleModal, handleActiveEdit, handleToggle }) => (
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
