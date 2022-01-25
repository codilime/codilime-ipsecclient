/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import { FC } from 'react';
import { RestConfForm } from './form';
import { HoverPanel } from 'template';
import { UseRestConfLogic } from 'hooks/';
import classNames from 'classnames';

interface RestConfType {
  open: boolean;
  handleClose: () => void;
}

export const RestConf: FC<RestConfType> = ({ open, handleClose }) => {
  const { handleSendRestConf, handleResetRestConf, active, description } = UseRestConfLogic(open);

  return (
    <>
      <div className={classNames('loginForm__wrapper', { loginForm__disabled: active })}>
        <h3 className="loginForm__title">Cat 9300x Credentials</h3>
        <RestConfForm {...{ handleSendRestConf, handleClose }} />
      </div>

      <HoverPanel
        {...{
          title: 'The variables are set.',
          description,
          button: 'Reset',
          active,
          handleReset: handleResetRestConf,
          handleClose
        }}
      />
    </>
  );
};
