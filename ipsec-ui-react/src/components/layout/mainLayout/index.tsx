import React, { FC, ReactNode } from 'react';
import { TopBar, SideBar } from 'layout';
import './styles.scss';

interface IMainLayout {
  children: ReactNode;
}

export const MainLayout: FC<IMainLayout> = ({ children }) => (
  <section className="mainLayout">
    <TopBar />
    <SideBar />
    <article className="mainLayout__content">{children}</article>
  </section>
);
