import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'common';
import { useGetLocation, useGetVrfs } from 'hooks';
import { IoHardwareChip } from 'react-icons/io5';
import classNames from 'classnames';
import './styles.scss';

export const SideBar = () => {
  const { vrfs } = useGetVrfs();
  const { currentLocation } = useGetLocation();

  const listContext =
    vrfs !== [] ? (
      vrfs.map(({ client_name, id }) => (
        <li className={`sideBar__eachVrf ${id === parseInt(currentLocation) ? 'sideBar__eachVrf--active' : ''}`} key={id}>
          <Link to={`/vrf/${id}`} className={classNames('sideBar__link', { sideBar__hardware: id === 1 })}>
            {client_name} {id === 1 && <IoHardwareChip />}
          </Link>
        </li>
      ))
    ) : (
      <li>no connections</li>
    );

  return (
    <div className="sideBar">
      <ul className="sideBar__list">{listContext}</ul>
      <div className="sideBar__addNew">
        <Button className="sideBar__btn">
          <Link to="/vrf/create" className="sideBar__btnLink">
            Add a new VRF
          </Link>
        </Button>
      </div>
    </div>
  );
};
