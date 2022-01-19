import { FC, useMemo } from 'react';
import { TopBar, SideBar } from 'layout/';
import { Loading } from 'template';
import { useDataContext, useVrfLogic } from 'hooks/';
import './styles.scss';
import { VrfProvider } from 'context';

export const MainLayout: FC = ({ children }) => {
  const {
    appContext: { loading }
  } = useDataContext();

  return (
    <section className="mainLayout">
      <TopBar />
      <SideBar />
      <article className="mainLayout__content">
        <VrfProvider>{children}</VrfProvider>
      </article>
      <Loading {...{ loading }} />
    </section>
  );
};
