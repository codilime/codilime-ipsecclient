import React from 'react';
import './SideBar.scss';
import NewVRF from './NewVRF.js';
import {HashRouter as Router, Switch, Route, Link, useParams} from 'react-router-dom';

import ciscoLogo from './images/cisco_logo.png';

export default function SideBar({routeProps}) {
    return (
        <Router>
            <div className="app-wrapper">
                <div className="sidebar-container">
                    <div>
                        <ul>
                            <li>
                                <Link to="/vrf/V101:U">V101:U</Link>
                            </li>
                            <li>
                                <Link to="/vrf/V102:SoccerOnline">V102:SoccerOnline</Link>
                            </li>
                            <li>
                                <Link to="/vrf/V103:BigBank">V103:BigBank</Link>
                            </li>
                            <li>
                                <Link to="/vrf/V104:BranchOffice">V104:BranchOffice</Link>
                            </li>
                            <li>
                                <Link to="/vrf/V105:test">V105:testtest</Link>
                            </li>
                            <li>
                                <Link to="/VRF/CREATE">
                                    <button className="btn new-vrf-button">Add a new VRF</button>
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="vrf-details">
                    <Switch>
                        <Route path="/VRF/CREATE" render={routeProps => <div><NewVRF routeProps={routeProps} /></div>} />
                        <Route path="/vrf/:id" render={routeProps => <div style={{ display: "flex" }}>/VRFs/{routeProps.match.params.id}</div>} />
                        <Route path="*" render={() => 404} />
                    </Switch>
                </div>
            </div>
        </Router>
    );
}

