export const validateDataInput = (event) => {
  const { name } = event.target;
  if (name !== 'lan_ip' || name !== 'local_as' || name !== 'vlan' || name !== 'remote_ip_sec' || name !== 'local_ip' || name !== 'peer_ip') {
    return;
  }
  if (!/[0-9/.]/.test(event.key)) {
    event.preventDefault();
    return;
  }
};
