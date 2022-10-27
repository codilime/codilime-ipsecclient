/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import { EndpointsType } from 'interface/index';
import { useState } from 'react';
import { useVrfLogic } from '.';

const validateStatus = {
  remote_ip_sec: false,
  psk: false,
  type: false,
  local_ip: false,
  peer_ip: false,
  local_id: false,
  source_interface: false,
  remote_as: false,
  local_cert: false,
  remote_cert: false,
  private_key: false,
  pkcs12_base64: false
};

const ipv4_regex = /^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}$/;
const ipv6_regex =
  /^(?:(?:[a-fA-F\d]{1,4}:){7}(?:[a-fA-F\d]{1,4}|:)|(?:[a-fA-F\d]{1,4}:){6}(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|:[a-fA-F\d]{1,4}|:)|(?:[a-fA-F\d]{1,4}:){5}(?::(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,2}|:)|(?:[a-fA-F\d]{1,4}:){4}(?:(?::[a-fA-F\d]{1,4}){0,1}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,3}|:)|(?:[a-fA-F\d]{1,4}:){3}(?:(?::[a-fA-F\d]{1,4}){0,2}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,4}|:)|(?:[a-fA-F\d]{1,4}:){2}(?:(?::[a-fA-F\d]{1,4}){0,3}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,5}|:)|(?:[a-fA-F\d]{1,4}:){1}(?:(?::[a-fA-F\d]{1,4}){0,4}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,6}|:)|(?::(?:(?::[a-fA-F\d]{1,4}){0,5}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,7}|:)))(?:%[0-9a-zA-Z]{1,})?$/;

const checkIpValue = (value: string) => {
  if (value === '') return true;
  if (ipv4_regex.test(value)) {
    return 'ipv4';
  }
  if (ipv6_regex.test(value)) {
    return 'ipv6';
  }
  return false;
};

export const useValidateEndpoint = () => {
  const [error, setError] = useState(validateStatus);
  const { hardware } = useVrfLogic();

  const validateEmptyEndpoint = (endpoints: EndpointsType, vrfEndpoints?: EndpointsType[] | null) => {
    const {
      remote_ip_sec,
      authentication: { psk, type, local_cert, remote_cert, private_key, pkcs12_base64 },
      local_ip,
      peer_ip
    } = endpoints;


    if (hardware && remote_ip_sec === '' && psk === '' && local_ip === '' && peer_ip === '') {
      setError((prev) => ({ ...prev, remote_ip_sec: true, psk: true, local_ip: true, peer_ip: true }));
      return false;
    }
    if (!hardware && remote_ip_sec === '' && psk === '' && local_ip === '') {
      setError((prev) => ({ ...prev, remote_ip_sec: true, psk: true, local_ip: true }));
      return false;
    }
    const checkRemote = ipv4_regex.test(remote_ip_sec);
    if (remote_ip_sec === '' || !checkRemote) {
      setError((prev) => ({ ...prev, remote_ip_sec: true }));
      return false;
    }

    const checkLocal = checkIpValue(local_ip);
    if (local_ip === '' || !checkLocal) {
      setError((prev) => ({ ...prev, local_ip: true }));
      return false;
    }
    const checkPeer = checkIpValue(peer_ip);

    if (!checkPeer) {
      setError((prev) => ({ ...prev, peer_ip: true }));
      return false;
    }

    if (peer_ip && checkPeer !== checkLocal) {
      setError((prev) => ({ ...prev, peer_ip: true, local_ip: true }));
      return false;
    }
    if (type === '') {
      return false;
    }
    if (type === 'psk' && psk === '') {
      setError((prev) => ({ ...prev, psk: true }));
      return false;
    }
    if (type === 'certs' && hardware && !psk) {
      setError((prev) => ({ ...prev, psk: true }));
      return false;
    }
    if (type === 'certs' && hardware && !pkcs12_base64) {
      setError((prev) => ({ ...prev, pkcs12_base64: true }));
      return false;
    }
    if (type === 'certs' && !hardware && !local_cert && !remote_cert && !private_key) {
      setError((prev) => ({ ...prev, local_cert: true, remote_cert: true, private_key: true }));
      return false;
    }
    if (type === 'certs' && !hardware && !local_cert) {
      setError((prev) => ({ ...prev, local_cert: true }));
      return false;
    }
    if (type === 'certs' && !hardware && !remote_cert) {
      setError((prev) => ({ ...prev, remote_cert: true }));
      return false;
    }
    if (type === 'certs' && !hardware && !private_key) {
      setError((prev) => ({ ...prev, private_key: true }));
      return false;
    }


    const exist = vrfEndpoints && vrfEndpoints.some(endpoint => endpoint.remote_ip_sec === endpoints.remote_ip_sec)
  
    if (exist) {
      setError((prev) => ({ ...prev, remote_ip_sec: true}));
      return false;
    }

    setError((prev) => ({ ...prev, remote_ip_sec: false, psk: false, local_ip: false, peer_ip: false, source_interface: false }));
    return true;
  };

  return { error, validateEmptyEndpoint, setError };
};
