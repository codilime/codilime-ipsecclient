import React from 'react';

import { Link } from 'react-router-dom';

import { Button } from '../components/common';
import './Sidebar.scss';

export default function Sidebar(props) {
  const { VRFConnections } = props;

  return (
    <div className="sidebar-container">
      {(!VRFConnections || VRFConnections.length === 0) && <p className="sidebar-text">no connections</p>}
      <ul className="sidebar-list">
        {VRFConnections &&
          VRFConnections.map((item) => (
            <li className="sidebar-list-item" key={item.id}>
              <Link to={'/vrf/' + item.id} replace>
                {item.client_name}
              </Link>
            </li>
          ))}
        <li>
          <Link to="/vrf/create" replace>
            <Button className="sidebar-add-button" textValue="Add a new VRF" />
          </Link>
        </li>
      </ul>
    </div>
  );
}
