import React from 'react';

import { HashRouter as Router, Route, Switch } from 'react-router-dom';

import { DetailViewVrf, NewVRF, DefaultView } from "pages";
import { MainLayout } from 'layout';

import './App.scss';
import 'style/Global.scss';

export default function App() {
  return (
    <Router>
      <MainLayout>
        <Switch>
          <Route path="/vrf/create" render={() => <NewVRF />} />
          <Route path="/vrf/:id" render={() => <DetailViewVrf />} />
          <Route path="*" render={() => <DefaultView />} />
        </Switch>
      </MainLayout>
    </Router>
  );
}
