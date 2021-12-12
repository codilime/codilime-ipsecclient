import { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom';
import { Spinner } from 'template';
import { ThemeProvider, VrfsProvider } from 'context';
const App = lazy(() => import('./App'));

ReactDOM.render(
  <ThemeProvider>
    <Suspense fallback={<Spinner loading={true}></Spinner>}>
      <VrfsProvider>
        <App />
      </VrfsProvider>
    </Suspense>
  </ThemeProvider>,
  document.getElementById('root')
);

module.hot && module.hot.accept();
