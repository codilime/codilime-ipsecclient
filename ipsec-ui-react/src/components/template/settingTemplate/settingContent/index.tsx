import { FC } from 'react';
import { Login, RestConf, SettingCertificates } from 'template';
import classNames from 'classnames';

interface SettingContentType {
  activeSetting: any;
  open: boolean;
}

export const SettingContent: FC<SettingContentType> = ({ activeSetting, open }) => (
  <>
    <article className={classNames('setting__content', { setting__content__active: activeSetting.profile })}>
      <Login />
    </article>
    <article className={classNames('setting__content', { setting__content__active: activeSetting.restConf })}>
      <RestConf {...{ open }} />
    </article>
    <article className={classNames('setting__content', { setting__content__active: activeSetting.certificate })}>
      <SettingCertificates />
    </article>
  </>
);
