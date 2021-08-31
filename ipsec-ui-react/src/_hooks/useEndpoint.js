import { useState, useContext, useEffect } from 'react';
import { VrfsContext } from 'context';
import { useFetchData } from 'hooks';

export const useEndpoint = (handleToggle) => {
  const { vrf, setVrf } = useContext(VrfsContext);
  const { data, loading } = vrf;
  const { endpoints } = data;
  const [send, setSend] = useState(false);
  const [vrfEndpoints, setVrfEndpoints] = useState(endpoints);
  const { putVrfData } = useFetchData();

  const handleChangeVrfEndpoints = (data, id) => {
    return vrfEndpoints.reduce((total, vrf, index) => {
      if (index === id) {
        return [...total, data];
      }
      return [...total, vrf];
    }, []);
  };

  const handleDeleteVrfEndpoints = (id) => {
    return vrfEndpoints.reduce((total, vrf, index) => {
      if (index === id) {
        return [...total];
      }
      return [...total, vrf];
    }, []);
  };

  const handleActionVrfEndpoints = (action, data, id) => {
    switch (action) {
      case 'add': {
        if (endpoints === null) {
          setVrf((prev) => ({ ...prev, data: { ...prev.data, endpoints: [data] } }));
          handleToggle();
          setSend(true);
          break;
        }
        setVrf((prev) => ({ ...prev, data: { ...prev.data, endpoints: [...prev.data.endpoints, data] } }));
        handleToggle();
        setSend(true);
        break;
      }
      case 'change': {
        const newArray = handleChangeVrfEndpoints(data, id);
        setVrf((prev) => ({ ...prev, data: { ...prev.data, endpoints: newArray } }));
        setSend(true);
        break;
      }
      case 'delete': {
        const newArray = handleDeleteVrfEndpoints(id);
        setVrf((prev) => ({ ...prev, data: { ...prev.data, endpoints: newArray } }));
        setSend(true);
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
