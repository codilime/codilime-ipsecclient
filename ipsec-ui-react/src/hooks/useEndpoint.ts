import { useState, useEffect } from 'react';
import { useFetchData, useAppContext } from 'hooks/';
import { EndpointsType } from 'interface/index';

export const useEndpoint = (handleToggle: () => void) => {
  const { context, setContext } = useAppContext();
  const { data, loading } = context;
  const { endpoint } = data;
  const [send, setSend] = useState(false);
  const [vrfEndpoints, setVrfEndpoints] = useState<EndpointsType[] | null>(endpoint);
  const { patchVrfData } = useFetchData();

  const handleChangeVrfEndpoints = (data: EndpointsType, id: number) => {
    if (vrfEndpoints === null) return;
    return vrfEndpoints.reduce((total: any, vrf, index) => {
      if (index === id) {
        return [...total, data];
      }
      return [...total, vrf];
    }, []);
  };

  const handleDeleteVrfEndpoints = (id: number) => {
    if (vrfEndpoints === null) return;
    return vrfEndpoints.reduce((total: any, vrf, index) => {
      if (index === id) {
        return [...total];
      }
      return [...total, vrf];
    }, []);
  };

  const handleActionVrfEndpoints = (action: string, data: EndpointsType, id?: number) => {
    switch (action) {
      case 'add': {
        if (endpoint === null) {
          setContext((prev) => ({ ...prev, data: { ...prev.data, endpoint: [data] } }));
          handleToggle();
          setSend(true);
          break;
        }
        setContext((prev) => ({ ...prev, data: { ...prev.data, endpoint: [...prev.data.endpoint!, data] } }));
        handleToggle();
        setSend(true);
        break;
      }
      case 'change': {
        const newArray = handleChangeVrfEndpoints(data, id!);
        setContext((prev) => ({ ...prev, data: { ...prev.data, endpoint: newArray } }));
        setSend(true);
        break;
      }
      case 'delete': {
        const newArray = handleDeleteVrfEndpoints(id!);
        setContext((prev) => ({ ...prev, data: { ...prev.data, endpoint: newArray } }));
        setSend(true);
        break;
      }
      default:
        break;
    }
  };

  useEffect(() => {
    setVrfEndpoints(endpoint);
  }, [endpoint]);

  useEffect(() => {
    console.log(data);
    if (send) {
      patchVrfData({ vrf: data });
      setSend(false);
    }
  }, [send]);

  return { vrfEndpoints, loading, handleChangeVrfEndpoints, handleActionVrfEndpoints };
};
