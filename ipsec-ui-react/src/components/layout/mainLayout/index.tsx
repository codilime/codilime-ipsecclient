import { FC } from 'react';
import PropTypes from 'prop-types';
import { TopBar, SideBar } from 'layout/';
import './styles.scss';

export const MainLayout: FC = ({ children }) => (
  <section className="mainLayout">
    <TopBar productName="IPsec User Interface" />
    <SideBar />
    <article className="mainLayout__content">{children}</article>
  </section>
);

MainLayout.propTypes = {
  children: PropTypes.element.isRequired
};
