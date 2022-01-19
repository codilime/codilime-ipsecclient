import { FC, useLayoutEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MainLayout } from 'layout/';
import { useInitData } from 'hooks/';
import { Routers } from './routers';
import { Theme } from './components/theme';
import 'style/global.scss';

const App: FC = () => {
  const { fetchVrfData, fetchCerts, fetchInitialData, loading } = useInitData();

  useLayoutEffect(() => {
    fetchCerts();
    // fetchInitialData();
  }, []);

  useLayoutEffect(() => {
    if (!loading) fetchVrfData();
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
