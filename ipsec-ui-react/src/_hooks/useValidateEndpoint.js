import { useState } from 'react';

export const useValidateEndpoint = (endpoints) => {
  const [error, setError] = useState({ remote_ip_sec: false, psk: false, local_ip: false, peer_ip: false, source_interface: false });
  console.log(endpoints);
  const validateEmptyEndpoint = () => {
    const { remote_ip_sec, psk, local_ip, peer_ip, remote_as, source_interface } = endpoints;

    if (remote_ip_sec === '' && psk === '' && local_ip === '' && peer_ip === '' && source_interface && remote_as) {
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
    if (psk === '') {
      setError((prev) => ({ ...prev, psk: true }));
      return false;
    }
    if (source_interface === '') {
      setError((prev) => ({ ...prev, source_interface: true }));
      return false;
    }
    setError({ remote_ip_sec: false, psk: false, local_ip: false, peer_ip: false, source_interface: false });
    return true;
  };

  return { error, validateEmptyEndpoint, setError };
};
