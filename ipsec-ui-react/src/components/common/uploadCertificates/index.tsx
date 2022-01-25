/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/licensecisco-sample-code-license/
 */

import { FC } from 'react';
import { EndpointInput } from 'common/';
import { InputType } from 'interface/components';
import { AiOutlineUpload } from 'react-icons/ai';
import classNames from 'classnames';
import './styles.scss';

interface UploadCertificates extends InputType {
  edit: boolean;
  label: string;
  text: string;
  className?: string;
  handleUploadFile: (name: string) => void;
  error?: any;
}

export const UploadCertificates: FC<UploadCertificates> = ({ type, name, onChange, edit, references, value, label, handleUploadFile, className = '' }) => (
  <div className={classNames('uploadCertificate', { [className]: className })}>
    <EndpointInput {...{ type, name, onChange, edit, references, value }} />
    {label && <p className="uploadCertificate__title">{label}</p>}
    <AiOutlineUpload onClick={() => handleUploadFile(name)} className="uploadCertificate__upload" />
  </div>
);
