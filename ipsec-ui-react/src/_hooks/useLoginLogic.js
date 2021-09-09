import { client } from 'api';

export const useLoginLogic = () => {
  const handleChangeGlobalPassword = (data) => {
    //TODO:request to change the password
    console.log(data, 'globalPassword');
  };

  const handleChangeRestConf = (data) => {
    //TODO:request to ...
    console.log(data, 'restConf');
  };

  const handleLogout = () => {
    window.location.reload();
    client('vrfs', {}, { method: 'POST', headers: { Authorization: '' } });
  };

  return { handleLogout, handleChangeGlobalPassword, handleChangeRestConf };
};
