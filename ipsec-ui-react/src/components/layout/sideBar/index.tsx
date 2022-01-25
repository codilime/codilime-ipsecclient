/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'common/';
import { useAppContext, useGetLocation, useThemeContext } from 'hooks/';
import { IoHardwareChip } from 'react-icons/io5';
import { HardwareId } from 'interface/enum';
import Logo from 'images/codilimeLogo.png';
import WhiteLogo from 'images/white_logo.png';
import classNames from 'classnames';
import './styles.scss';

export const SideBar: FC = () => {
  const {
    context: { vrf }
  } = useAppContext();
  const { currentLocation } = useGetLocation();
  const { theme } = useThemeContext();

  const listVrf = vrf.length
    ? vrf.sort((a, b): any => {
        if (a.id && b.id) {
          return a.id - b.id;
        }
      })
    : vrf;

  const listContext = vrf ? (
    listVrf.map(({ client_name, id }) => (
      <li className={classNames('sideBar__eachVrf', { sideBar__eachVrf__active: id == parseInt(currentLocation) })} key={id}>
        <Link to={`/vrf/${id}`} className={classNames('sideBar__link')}>
          {client_name} {id === parseInt(HardwareId) && <IoHardwareChip className="sideBar__icon" />}
        </Link>
      </li>
    ))
  ) : (
    <li>no connections</li>
  );

  return (
    <div className="sideBar">
      <div className="sideBar__logo">
        <img src={theme === 'dark' ? WhiteLogo : Logo} alt="Codilime logo" className="sideBar__image" />
      </div>
      <ul className="sideBar__list">{listContext}</ul>
      <div className="sideBar__addNew">
        <Button className="sideBar__btn">
          <Link to="/vrf/create" className="sideBar__btnLink">
            Add new VRF
          </Link>
        </Button>
      </div>
    </div>
  );
};
