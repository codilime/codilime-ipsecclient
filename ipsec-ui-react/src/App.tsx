import { FC, useEffect, useLayoutEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MainLayout } from 'layout/';
import { useInitData } from 'hooks/';
import { Routers } from './routers';
import 'style/global.scss';

const App: FC = () => {
  const { fetchVrfData, fetchVrfSettings, loading, fetchRestConf } = useInitData();

  useLayoutEffect(() => {
    fetchVrfSettings();
    fetchRestConf();
  }, []);

  useEffect(() => {
    if (!loading) fetchVrfData();
  }, [loading]);

  return (
    <Router>
      <MainLayout>
        <Routers />
      </MainLayout>
    </Router>
  );
};

export default App;
