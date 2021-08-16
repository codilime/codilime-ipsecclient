import React, { lazy, Suspense } from 'react';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import { MainLayout } from 'layout';
import { DefaultView } from 'pages';
import 'style/global.scss';
const VrfView = lazy(() => import('./components/pages/vrfView'));

export const App = () => {
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
};
