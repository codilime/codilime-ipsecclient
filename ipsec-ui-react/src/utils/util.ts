// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const validateDataInput = (e) => {
  const { name } = e.target;
  if (name === 'client_name' || name === 'physical_interface' || name === 'psk' || name ==='source_interface') {
    return;
  }
  if (!/[0-9/.]/.test(e.key)) {
    e.preventDefault();
    return;
  }
};
