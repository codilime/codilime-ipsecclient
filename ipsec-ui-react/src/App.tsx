import React, { useEffect, useLayoutEffect, FC } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MainLayout } from 'layout/';
import { useInitData } from 'hooks/';
import { Routers } from './routers';
import 'style/global.scss';

const App: FC = () => {
  const { fetchVrfData, fetchVrfSettings, loading } = useInitData();

  useLayoutEffect(() => {
    fetchVrfSettings();
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
