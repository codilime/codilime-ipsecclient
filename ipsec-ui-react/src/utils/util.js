export const validateDataInput = (event) => {
  const { name } = event.target;
  if (name === 'client_name' || name === 'physical_interface' || name === 'psk' || name ==='source_interface') {
    return;
  }
  if (!/[0-9/.]/.test(event.key)) {
    event.preventDefault();
    return;
  }
};
