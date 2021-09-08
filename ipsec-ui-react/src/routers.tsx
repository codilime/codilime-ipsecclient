import React, { FC } from 'react';
import { Route, Switch } from 'react-router-dom';
import { DefaultView, VrfView } from 'components/pages';

export const Routers: FC = () => {
  return (
    <Switch>
      <Route exact path="/vrf/create" component={VrfView} />
      <Route exact path="/vrf/:id" component={VrfView} />
      <Route path="*" component={DefaultView} />
    </Switch>
  );
};