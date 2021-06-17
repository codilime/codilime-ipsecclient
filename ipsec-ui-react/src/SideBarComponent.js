import React from 'react';
import './SideBarComponent.scss';
import {BrowserRouter as Router, Switch, Route, Link} from 'react-router-dom';

import ciscoLogo from './images/cisco_logo.png';

const routes = [
    {
        path: "/",
        exact: true,
        sidebar: () => <div>home!</div>,
        main: () => <h2>Home</h2>
    },
    {
        path: "/bubblegum",
        sidebar: () => <div>bubblegum!</div>,
        main: () => <h2>Bubblegum</h2>
    },
    {
        path: "/shoelaces",
        sidebar: () => <div>shoelaces!</div>,
        main: () => <h2>Shoelaces</h2>
    }
];

export default function SideBarComponent({routeProps}) {
    return (
        <div className="sidebar-container">
            <Router>
                <div style={{ display: "flex" }}>
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

                        <Switch>
                            {routes.map((route, index) => (
                                // You can render a <Route> in as many places
                                // as you want in your app. It will render along
                                // with any other <Route>s that also match the URL.
                                // So, a sidebar or breadcrumbs or anything else
                                // that requires you to render multiple things
                                // in multiple places at the same URL is nothing
                                // more than multiple <Route>s.
                                <Route
                                    key={index}
                                    path={route.path}
                                    exact={route.exact}
                                    children={<route.sidebar />}
                                />
                            ))}
                        </Switch>
                    </div>

                    <div style={{ flex: 1, padding: "10px" }}>
                        <Switch>
                            {routes.map((route, index) => (
                                // Render more <Route>s with the same paths as
                                // above, but different components this time.
                                <Route
                                    key={index}
                                    path={route.path}
                                    exact={route.exact}
                                    children={<route.main />}
                                />
                            ))}
                        </Switch>
                    </div>
                </div>
            </Router>
        </div>
    );
}

