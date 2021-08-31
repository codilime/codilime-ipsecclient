import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { DefaultView, VrfView } from 'pages';

export const Routers = () => {
  return (
    <Switch>
      <Route exact path="/vrf/create" component={VrfView} />
      <Route exact path="/vrf/:id" component={VrfView} />
      <Route path="*" component={DefaultView} />
    </Switch>
  );
};
