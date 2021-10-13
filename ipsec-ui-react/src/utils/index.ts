import { pki } from 'node-forge';

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

export const decodeX509 = (x509: string) => {
  if (x509 !== '' && x509.includes('CERTIFICATE')) {
    const cert = pki.certificateFromPem(x509);
    const { value: CN } = cert.subject.attributes.filter((attr) => attr.shortName === 'CN')[0];
    const { value: ON } = cert.subject.attributes.filter((attr) => attr.shortName === 'O')[0];
    const decode: { CN: string; ON: string } = { CN, ON };
    return decode;
  }
  return { CN: '', ON: '' };
};
