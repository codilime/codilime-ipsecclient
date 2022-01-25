/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import { FC } from 'react';
import { IoPencil, IoTrashBin } from 'react-icons/io5';
import classNames from 'classnames';
import './styles.scss';

interface EndpointOptionType {
  open: boolean;
  handleToggleModal: () => void;
  handleActiveEdit: () => void;
  handleToggle: () => void;
}

export const EndpointOption: FC<EndpointOptionType> = ({ open, handleToggleModal, handleActiveEdit, handleToggle }) => (
  <div className={classNames('endpointOption', { endpointOption__active: open })} onMouseLeave={handleToggle}>
    <ul className="endpointOption__list">
      <li className="endpointOption__item" onClick={handleActiveEdit}>
        <IoPencil className="endpointOption__icon" /> Edit
      </li>
      <li className="endpointOption__item endpointOption__delete " onClick={handleToggleModal}>
        <IoTrashBin className="endpointOption__icon" /> Delete
      </li>
    </ul>
  </div>
);
