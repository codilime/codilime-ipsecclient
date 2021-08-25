import { useEffect } from 'react';
import { useFetchData, useGetLocation } from 'hooks';

export const useGetEndpointStatus = () => {
  const { fetchEndpointStatus } = useFetchData();
  const { currentLocation } = useGetLocation();

  //  useEffect(()=>{
  //     fetchEndpointStatus();
  //  },[currentLocation])

  return {};
};
