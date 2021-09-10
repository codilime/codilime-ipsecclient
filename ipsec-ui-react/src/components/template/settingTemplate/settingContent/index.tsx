import { FC } from 'react';
import { LoginForm, RestConfForm, SettingCertificates } from 'template';
import classNames from 'classnames';

interface settingContentType {
  activeSetting: any;
}

export const SettingContent: FC<settingContentType> = ({ activeSetting }) => {
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
