/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom';
import { Loading } from 'template';
import { ThemeProvider, VrfsProvider } from 'context';
const App = lazy(() => import('./App'));

ReactDOM.render(
  <Suspense fallback={<Loading loading={true}></Loading>}>
    <VrfsProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </VrfsProvider>
  </Suspense>,
  document.getElementById('root')
);

module.hot && module.hot.accept();
