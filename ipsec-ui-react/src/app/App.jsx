import React from 'react';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import { MainLayout } from 'layout';
import { NewVRF, DetailViewVrf, DefaultView } from 'pages';
import './App.scss';
import 'style/global.scss';

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
