import { useState, useEffect } from 'react';
import { useFetchData, useAppContext } from 'hooks/';
import { endpointsType } from 'interface/index';

export const useEndpoint = (handleToggle: () => void) => {
  const { vrf, setVrf } = useAppContext();

  const { data, loading } = vrf;
  const { endpoints } = data;
  const [send, setSend] = useState(false);
  const [vrfEndpoints, setVrfEndpoints] = useState<endpointsType[] | null>(endpoints);
  const { putVrfData } = useFetchData();

  const handleChangeVrfEndpoints = (data: any, id: number) => {
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

  const handleActionVrfEndpoints = (action: string, data: endpointsType, id?: number) => {
    switch (action) {
      case 'add': {
        if (endpoints === null) {
          setVrf((prev) => ({ ...prev, data: { ...prev.data, endpoints: [data] } }));
          handleToggle();
          setSend(true);
          break;
        }
        setVrf((prev) => ({ ...prev, data: { ...prev.data, endpoints: [...prev.data.endpoints!, data] } }));
        handleToggle();
        setSend(true);
        break;
      }
      case 'change': {
        const newArray = handleChangeVrfEndpoints(data, id!);
        setVrf((prev) => ({ ...prev, data: { ...prev.data, endpoints: newArray } }));
        setSend(true);

        break;
      }
      case 'delete': {
        const newArray = handleDeleteVrfEndpoints(id!);
        setVrf((prev) => ({ ...prev, data: { ...prev.data, endpoints: newArray } }));
        setSend(true);
        break;
      }
      default:
        break;
    }
  };

  useEffect(() => {
    setVrfEndpoints(endpoints);
  }, [endpoints]);

  useEffect(() => {
    if (send) {
      putVrfData(data);
      setSend(false);
    }
  }, [send]);

  return { vrfEndpoints, loading, handleChangeVrfEndpoints, handleActionVrfEndpoints };
};
