import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'common';
import { useGetLocation, useGetVrfs } from 'hooks';
import './styles.scss';

export const SideBar = () => {
  const { vrfs } = useGetVrfs();
  const { idVrf } = useGetLocation();
  const listContext =
    vrfs !== [] ? (
      vrfs.map(({ client_name, id }) => (
        <li className={`sideBar__eachVrf ${id === idVrf ? 'sideBar__eachVrf--active' : ''}`} key={id}>
          <Link to={`/vrf/${id}`} className="sideBar__link">
            {client_name}
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
