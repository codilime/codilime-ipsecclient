import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { DefaultView, VrfView } from 'pages';

export const Routers = () => {
  return (
    <Switch>
      <Route exact path="/vrf/create" render={() => <VrfView />} />
      <Route exact path="/vrf/:id" render={() => <VrfView />} />
      <Route path="*" render={() => <DefaultView />} />
    </Switch>
  );
};
