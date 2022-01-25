/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import { FC } from 'react';
import { TopBar, SideBar } from 'layout/';
import { Loading } from 'template';
import { useVrfLogic } from 'hooks/';
import { SnackBar } from 'common/';
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
