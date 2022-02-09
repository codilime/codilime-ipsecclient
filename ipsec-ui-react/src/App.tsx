/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import { FC, useLayoutEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MainLayout } from 'layout/';
import { useInitData } from 'hooks/';
import { Routers } from './routers';
import { Theme } from './components/theme';
import 'style/global.scss';

const App: FC = () => {
  const { InitData, setVrfData, setNotification, loading } = useInitData();
  useLayoutEffect(() => InitData(), []);

  useLayoutEffect(() => {
    if (!loading) {
      setVrfData();
      setNotification();
    }
  }, [loading]);

  return (
    <Router>
      <Theme>
        <MainLayout>
          <Routers />
        </MainLayout>
      </Theme>
    </Router>
  );
};

export default App;
