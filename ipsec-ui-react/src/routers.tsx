/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import { FC } from 'react';
import { Route, Switch } from 'react-router-dom';
import { VrfView } from 'pages/';

export const Routers: FC = () => (
  <Switch>
    <Route exact path="/vrf/create" component={VrfView} />
    <Route exact path="/vrf/:id" component={VrfView} />
    <Route path="*" component={VrfView} />
  </Switch>
);
