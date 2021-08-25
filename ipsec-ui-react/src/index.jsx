import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom';
import { Spinner } from 'common';
import { VrfsProvider } from 'context';
const App = lazy(() => import('./App'));

ReactDOM.render(
  <Suspense fallback={<Spinner/>}>
    <VrfsProvider>
      <App />
    </VrfsProvider>
  </Suspense>,
  document.getElementById('root')
);

module.hot.accept();
