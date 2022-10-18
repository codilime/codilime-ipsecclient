/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import { FC } from 'react';
import { AiOutlineUpload } from 'react-icons/ai';
import { LogData } from '../logData';
import { Button } from 'common/';
import { useLogsLogic } from 'hooks/';
import { Field } from 'template';
import classNames from 'classnames';

interface EachLogType {
  name: string;
  log: string;
  active: boolean;
}

export const EachLog: FC<EachLogType> = ({ name, log, active }) => {
  const { autoScroll, loading, HandleDownloadTextFile, handleActiveScroll } = useLogsLogic();

  return (
    <div className={classNames('logs__context', { logs__context__active: active })}>
      {<LogData {...{ log, loading, autoScroll }} />}
      <div className="popup__footer">
        <Field {...{ type: 'checkbox', name, onChange: handleActiveScroll, checked: autoScroll, text: 'Auto Scroll', className: 'logs_btn' }} />
        <Button className="logs__save" onClick={() => HandleDownloadTextFile(log, name)}>
          export <AiOutlineUpload className="logs_icon" />
        </Button>
      </div>
    </div>
  );
};
