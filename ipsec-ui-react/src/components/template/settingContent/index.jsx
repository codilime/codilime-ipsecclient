import React from 'react';
import { LoginForm, RestConfForm } from 'template';
import classNames from 'classnames';

export const SettingContent = ({ activeSetting }) => {
  return (
    <>
      <article className={classNames('setting__content', { setting__content__active: activeSetting.profile })}>
        <LoginForm />
      </article>
      <article className={classNames('setting__content', { setting__content__active: activeSetting.restConf })}>
        <RestConfForm />
      </article>
      <article className={classNames('setting__content', { setting__content__active: activeSetting.certificate })}>
        <RestConfForm />
      </article>
    </>
  );
};
