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

export function handleTakeTime() {
  const today = new Date();
  const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
  const time = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
  const dateTime = date + ' ' + time;
  return dateTime;
}
