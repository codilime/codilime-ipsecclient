import { FC } from 'react';
import { TopBar, SideBar } from 'layout/';
import './styles.scss';

export const MainLayout: FC = ({ children }) => (
  <section className="mainLayout">
    <TopBar productName="Codilime Ipsec Client" />
    <SideBar />
    <article className="mainLayout__content">{children}</article>
  </section>
);
