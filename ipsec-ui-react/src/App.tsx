import { FC, useLayoutEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MainLayout } from 'layout/';
import { useInitData } from 'hooks/';
import { Routers } from './routers';
import { Theme } from './components/theme';
import 'style/global.scss';
import { VrfProvider } from 'context';

const App: FC = () => {
  //const { fetchVrfData, fetchCerts, fetchInitialData, loading } = useInitData();
  const { fetchVrfData, fetchCerts, fetchTest } = useInitData();

  useLayoutEffect(() => {
    fetchTest();
  }, []);

  console.log('app');
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
