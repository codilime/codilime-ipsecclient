import { FC, useLayoutEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MainLayout } from 'layout/';
import { useInitData } from 'hooks/';
import { Routers } from './routers';
import 'style/global.scss';

const App: FC = () => {
  const { fetchVrfData, fetchCerts, loading } = useInitData();

  useLayoutEffect(() => {
    fetchCerts();
  }, []);

  useLayoutEffect(() => {
    if (!loading) fetchVrfData();
  }, [loading]);
  console.log('app');
  return (
    <Router>
      <MainLayout>
        <Routers />
      </MainLayout>
    </Router>
  );
};

export default App;
