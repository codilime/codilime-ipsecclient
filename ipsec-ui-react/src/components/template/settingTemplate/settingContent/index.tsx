import React, { FC } from 'react';
import { LoginForm, RestConfForm, SettingCertificates } from 'template';
import classNames from 'classnames';

interface ISettingContent {
  activeSetting: { profile: boolean; restConf: boolean; certificate: boolean };
}

export const SettingContent: FC<ISettingContent> = ({ activeSetting }) => {
  return (
    <>
      <article className={classNames('setting__content', { setting__content__active: activeSetting.profile })}>
        <LoginForm />
      </article>
      <article className={classNames('setting__content', { setting__content__active: activeSetting.restConf })}>
        <RestConfForm />
      </article>
      <article className={classNames('setting__content', { setting__content__active: activeSetting.certificate })}>
        <SettingCertificates />
      </article>
    </>
  );
};
