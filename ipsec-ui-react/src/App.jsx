import React from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { MainLayout } from 'layout';
import { Routers } from './routers';
import 'style/global.scss';

export const App = () => {
  return (
    <Router>
      <MainLayout>
        <Routers />
      </MainLayout>
    </Router>
  );
};
