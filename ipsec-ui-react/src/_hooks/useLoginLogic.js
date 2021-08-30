import { client } from 'api';
import { useGetLocation } from 'hooks';

export const useLoginLogic = () => {
  //TODO:CHANGE LOGIN/PASSWORD

  const handleLogout = () => {
    window.location.reload();
    client('vrfs', {}, { method: 'POST', headers: { Authorization: '' } });
  };

  return { handleLogout };
};
