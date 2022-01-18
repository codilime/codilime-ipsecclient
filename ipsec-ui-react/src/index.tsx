import { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom';
import { Spinner } from 'template';
import { ThemeProvider, VrfsProvider } from 'context';
const App = lazy(() => import('./App'));

ReactDOM.render(
  <VrfsProvider>
    <Suspense fallback={<Spinner loading={true}></Spinner>}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </Suspense>
  </VrfsProvider>,
  document.getElementById('root')
);

module.hot && module.hot.accept();
