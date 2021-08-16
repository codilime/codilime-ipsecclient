import React, { lazy, Suspense } from 'react';
import { Route, Switch } from 'react-router-dom';
import { DefaultView } from 'pages';
const VrfView = lazy(() => import('./components/pages/vrfView'));

export const Routers = () => {
  return (
    <Suspense fallback={<span>loading...</span>}>
      <Switch>
        <Route exact path="/vrf/create" render={() => <VrfView />} />
        <Route exact path="/vrf/:id" render={() => <VrfView />} />
        <Route path="*" render={() => <DefaultView />} />
      </Switch>
    </Suspense>
  );
};
