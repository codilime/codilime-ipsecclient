import React, { lazy, Suspense } from 'react';
import PropTypes from 'prop-types';

import { TopBar, SideBar } from 'layout';
import { VrfsProvider } from 'context';

import './styles.scss';

export const MainLayout = ({ children }) => (
  <VrfsProvider>
    <section className="mainLayout">
      <TopBar />
      <SideBar />
      <article className="mainLayout__content">{children}</article>
    </section>
  </VrfsProvider>
);
MainLayout.propTypes = {
  children: PropTypes.element.isRequired
};
