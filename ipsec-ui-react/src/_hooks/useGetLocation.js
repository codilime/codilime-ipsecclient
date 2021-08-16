import { useLocation } from 'react-router-dom';
import { useHistory } from 'react-router-dom';

export const useGetLocation = () => {
  const location = useLocation();
  const history = useHistory();

  const currentLocation = location.pathname.split('/vrf/')[1];

  return { currentLocation, history };
};
