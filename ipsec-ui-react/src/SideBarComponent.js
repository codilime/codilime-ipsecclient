import React from 'react';
import './SideBarComponent.scss';
import {BrowserRouter as Router, Switch, Route, Link} from 'react-router-dom';

import ciscoLogo from './images/cisco_logo.png';

export default function SideBarComponent(props) {
    return (
        <div className="sidebar-container">
            <Router>
                <div>
                    <ul>
                        <li>
                            <Link to="/">Home</Link>
                        </li>
                        <li>
                            <Link to="/about">About</Link>
                        </li>
                        <li>
                            <Link to="/dashboard">Dashboard</Link>
                        </li>
                    </ul>

                    <hr />
                    <Switch>
                        <Route exact path="/">
                            <Home />
                        </Route>
                        <Route path="/about">
                            <About />
                        </Route>
                        <Route path="/dashboard">
                            <Dashboard />
                        </Route>
                    </Switch>
                </div>
            </Router>
        </div>
    );
}

function Home() {
    return (
        <div className="vrf-settings">
            <h2>Home</h2>
        </div>
    );
}

function About() {
    return (
        <div className="vrf-settings">
            <h2>About</h2>
        </div>
    );
}

function Dashboard() {
    return (
        <div className="vrf-settings">
            <h2>Dashboard</h2>
        </div>
    );
}
