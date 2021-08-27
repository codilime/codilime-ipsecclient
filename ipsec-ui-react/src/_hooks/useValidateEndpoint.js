import { useState } from 'react';

const validateStatus = {
  remote_ip_sec: false,
  psk: false,
  local_ip: false,
  peer_ip: false,
  source_interface: false
};

const checkIpValue = (value) => {
  const arrayOfValue = value.split('.');
  const validateIP = arrayOfValue.reduce((total, value) => {
    if (parseInt(value) > 255 || parseInt(value) < 0) {
      return [...total, value];
    }
    return [...total];
  }, []);
  return !validateIP.length && arrayOfValue.length === 4 ? false : true;
};

export const useValidateEndpoint = (endpoints) => {
  const [error, setError] = useState(validateStatus);
  const validateEmptyEndpoint = () => {
    const { remote_ip_sec, psk, local_ip, peer_ip, remote_as, source_interface } = endpoints;
    if (remote_ip_sec === '' && psk === '' && local_ip === '' && peer_ip === '') {
      setError({ remote_ip_sec: true, psk: true, local_ip: true, peer_ip: true });
      return false;
    }
    const checkRemote = checkIpValue(remote_ip_sec);
    if (remote_ip_sec === '' || remote_ip_sec.length > 16 || checkRemote) {
      setError((prev) => ({ ...prev, remote_ip_sec: true }));
      return false;
    }
    const checkLocal = checkIpValue(local_ip);
    if (local_ip === '' || local_ip.length > 16 || checkLocal) {
      setError((prev) => ({ ...prev, local_ip: true }));
      return false;
    }

    const checkPeer = checkIpValue(local_ip);
    if (peer_ip === '' || peer_ip.length > 16 || checkPeer) {
      setError((prev) => ({ ...prev, peer_ip: true }));
      return false;
    }
    if (psk === '') {
      setError((prev) => ({ ...prev, psk: true }));
      return false;
    }
    setError({ remote_ip_sec: false, psk: false, local_ip: false, peer_ip: false, source_interface: false });
    return true;
  };

  return { error, validateEmptyEndpoint, setError };
};
