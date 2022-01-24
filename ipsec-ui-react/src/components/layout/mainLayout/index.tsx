import { FC } from 'react';
import { TopBar, SideBar } from 'layout/';
import { Loading } from 'template';
import { useVrfLogic } from 'hooks/';
import { SnackBar } from 'common/';
import 'style/global.scss';
import './styles.scss';

export const MainLayout: FC = ({ children }) => {
  const {
    context: { loading }
  } = useVrfLogic();

  return (
    <section className="mainLayout">
      <TopBar />
      <SideBar />
      <article className="mainLayout__content">{children}</article>
      <Loading {...{ loading }} />
      <SnackBar />
    </section>
  );
};
