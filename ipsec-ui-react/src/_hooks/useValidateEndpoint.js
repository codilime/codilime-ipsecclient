import { useState } from 'react';

export const useValidateEndpoint = (endpoints) => {
  const [error, setError] = useState({ remote_ip_sec: false, psk: false, local_ip: false, peer_ip: false });

  const validateEmptyEndpoint = () => {
    const { remote_ip_sec, psk, local_ip, peer_ip } = endpoints;

    if (remote_ip_sec === '' && psk === '' && local_ip === '' && peer_ip === '') {
      setError({ remote_ip_sec: true, psk: true, local_ip: true, peer_ip: true });
      return false;
    }
    if (remote_ip_sec === '' || remote_ip_sec.length > 16) {
      setError((prev) => ({ ...prev, remote_ip_sec: true }));
      return false;
    }
    if (local_ip === '' || local_ip.length > 16) {
      setError((prev) => ({ ...prev, local_ip: true }));
      return false;
    }
    if (peer_ip === '' || peer_ip.length > 16) {
      setError((prev) => ({ ...prev, peer_ip: true }));
      return false;
    }
    if (psk === '' || psk.length > 16) {
      setError((prev) => ({ ...prev, psk: true }));
      return false;
    }
    setError({ remote_ip_sec: false, psk: false, local_ip: false, peer_ip: false });
    return true;
  };

  return { error, validateEmptyEndpoint, setError };
};
