import React, { FC } from 'react';
import { TopBar, SideBar } from 'layout/';
import './styles.scss';

export const MainLayout: FC = ({ children }) => (
  <section className="mainLayout">
    <TopBar productName="IPsec User Interface" />
    <SideBar />
    <article className="mainLayout__content">{children}</article>
  </section>
);
