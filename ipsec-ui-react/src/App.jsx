import React, { lazy, Suspense } from 'react';

import { HashRouter as Router, Route, Switch } from 'react-router-dom';

import { MainLayout } from 'layout';
import { DefaultView } from 'pages';

const VrfView = lazy(() => import('./components/pages/vrfView'));

import 'style/global.scss';

export default function App() {
  return (
      <Router>
          <MainLayout>
              <Suspense fallback={<span>loading...</span>}>
                  <Switch>
                      <Route exact path="/vrf/create" render={() => <VrfView />} />
                      <Route exact path="/vrf/:id" render={() => <VrfView />} />
                      <Route path="*" render={() => <DefaultView />} />
                  </Switch>
              </Suspense>
          </MainLayout>
      </Router>
  );
}
