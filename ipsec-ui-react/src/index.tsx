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
