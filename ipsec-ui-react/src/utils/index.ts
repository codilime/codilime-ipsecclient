import { pki, util } from 'node-forge';
import { useCallback } from 'react';

export const validateDataInput = (event: any) => {
  const { name } = event.target;
  if (name === 'client_name' || name === 'physical_interface' || name === 'psk' || name === 'source_interface') {
    return;
  }
  if (!/[0-9/.]/.test(event.key)) {
    event.preventDefault();
    return;
  }
};

function displayTime(time: number) {
  if (time < 10) {
    return '0' + time;
  }
  return time;
}

export function handleTakeTime() {
  const today = new Date();
  const mounth = today.getMonth() + 1;
  const date = today.getDate();
  const hours = today.getHours();
  const minutes = today.getMinutes();
  const secound = today.getSeconds();
  const currentData = today.getFullYear() + '-' + displayTime(mounth) + '-' + displayTime(date);
  const time = displayTime(hours) + ':' + displayTime(minutes) + ':' + displayTime(secound);
  const dateTime = currentData + ' ' + time;
  return dateTime;
}

export const pkcs12ToBase64 = (el: any) => util.encode64(el);

export const decodeX509 = (x509: string) => {
  if (x509 !== '' && x509.includes('CERTIFICATE')) {
    const cert = pki.certificateFromPem(x509);
    const { value: CN } = cert.subject.attributes.filter((attr) => attr.shortName === 'CN')[0];
    const { value: ON } = cert.subject.attributes.filter((attr) => attr.shortName === 'O')[0];

    if (typeof CN === 'string' && typeof ON === 'string') {
      const decode: { CN: string; ON: string } = { CN, ON };
      return decode;
    }
  }
  return { CN: '', ON: '' };
};

export const compressIPV6 = (ip: string) => {
  if (!ip) return;
  let formatted = ip.toString().replace(/\b(?:0+:){2,}/, ':');
  let finalAddress = formatted
    .split(':')
    .map(function (octet) {
      return octet.replace(/\b0+/g, '');
    })
    .join(':');
  return finalAddress;
};
