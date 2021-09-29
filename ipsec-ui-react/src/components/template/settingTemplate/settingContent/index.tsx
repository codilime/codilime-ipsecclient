import { FC } from 'react';
import { Login, RestConf, SettingCertificates } from 'template';
import classNames from 'classnames';

interface settingContentType {
  activeSetting: any;
}

export const SettingContent: FC<settingContentType> = ({ activeSetting }) => {
  return (
    <>
      <article className={classNames('setting__content', { setting__content__active: activeSetting.profile })}>
        <Login />
      </article>
      <article className={classNames('setting__content', { setting__content__active: activeSetting.restConf })}>
        <RestConf />
      </article>
      <article className={classNames('setting__content', { setting__content__active: activeSetting.certificate })}>
        <SettingCertificates />
      </article>
    </>
  );
};
