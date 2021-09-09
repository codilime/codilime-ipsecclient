import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom';
import { Spinner } from './components/template';
import { VrfsProvider } from './_context';
//const App = lazy(() => import('./App'));

ReactDOM.render(
  <Suspense fallback={<div>Loading</div>}>
    <VrfsProvider>
      {/* <App /> */}
      <h3>hjello</h3>
    </VrfsProvider>
  </Suspense>,
  document.getElementById('root')
);
