import { FC } from 'react';
import { TopBar, SideBar } from 'layout/';
import './styles.scss';

export const MainLayout: FC = ({ children }) => (
  <section className="mainLayout">
    <TopBar productName="CODILIME IPSEC CLIENT" />
    <SideBar />
    <article className="mainLayout__content">{children}</article>
  </section>
);
