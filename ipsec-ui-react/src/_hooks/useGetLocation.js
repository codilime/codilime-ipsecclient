import { useLocation } from 'react-router-dom';

export const useGetLocation = () => {
  const location = useLocation();
  const idVrf = parseInt(location.pathname.split('/vrf/')[1]);
  return { idVrf };
};
