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
