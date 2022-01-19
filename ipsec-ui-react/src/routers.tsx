import { FC } from 'react';
import { Route, Switch } from 'react-router-dom';
import { VrfView } from 'pages/';

export const Routers: FC = () => (
  <Switch>
    <Route path="/" component={VrfView} />
    <Route exact path="/vrf/create" component={VrfView} />
    <Route exact path="/vrf/:id" component={VrfView} />
    <Route path="*" component={VrfView} />
  </Switch>
);
