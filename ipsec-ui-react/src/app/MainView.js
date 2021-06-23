import React from 'react';
import './MainView.scss';
import NewVRF from "../pages/NewVRF";
import {HashRouter as Router, Switch, Route} from 'react-router-dom';

export default function MainView () {
    // const VRFList = props.VRFConnections;


    return (
        <div className="main-view-container">
                <Router>
                    <Switch>
                        <Route path="/VRF/CREATE" render={routeProps => <div><NewVRF routeProps={routeProps} /></div>} />
                        <Route path="/vrf/:id" render={routeProps => <div style={{ display: "flex" }}>/VRF/{routeProps.match.params.id}</div>} />
                        <Route path="*" render={() => 404} />
                    </Switch>
                </Router>
        </div>
    )
}