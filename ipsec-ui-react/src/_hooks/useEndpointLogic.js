import React, { useState, useContext, useEffect } from 'react';
import { EndpointInput } from 'common';
import { endpointInputSchema } from 'db';
import { VrfsContext } from 'context';
import { useFetchData } from 'hooks';

export const useEndpointLogic = (endpoint) => {
  const [disabled, setDisable] = useState(false);
  const [edit, setEdit] = useState(false);
  const [send, setSend] = useState(false);
  const [endpoints, setEndpoint] = useState(endpoint);
  const {
    vrf: { data },
    setVrf
  } = useContext(VrfsContext);
  const { putVrfData } = useFetchData();
  const handleActiveEdit = () => setEdit((prev) => !prev);

  const handleDelete = () => {
    console.log('click');
  };

  const onChange = (e) => {
    const { value, name } = e.target;
    switch (name) {
      case 'remote_ip_sec': {
        setEndpoint((prev) => ({
          ...prev,
          remote_ip_sec: value
        }));
        break;
      }
      case 'local_ip': {
        setEndpoint((prev) => ({
          ...prev,
          local_ip: value
        }));
        break;
      }
      case 'peer_ip': {
        setEndpoint((prev) => ({
          ...prev,
          peer_ip: value
        }));
        break;
      }
      case 'psk': {
        setEndpoint((prev) => ({
          ...prev,
          psk: value
        }));
        break;
      }
      default:
        return;
    }
  };

  const onClick = (e) => {
    const { checked, name } = e.target;
    switch (name) {
      case 'nat': {
        setEndpoint((prev) => ({
          ...prev,
          nat: checked
        }));
        break;
      }
      case 'bgp': {
        setEndpoint((prev) => ({
          ...prev,
          bgp: checked
        }));
        break;
      }
      case 'add': {
        setActive((prev) => !prev);
      }
      default:
        return;
    }
  };

  const newEndpointState = edit ? endpoints : endpoint;

  const displayEndpoint = endpointInputSchema.map((el) => {
    if (el.type === 'checkbox') {
      return (
        <td key={el.name} className="table__column">
          <EndpointInput {...{ ...el, onClick }} value={newEndpointState[el.name]} />
          <span>Active</span>
        </td>
      );
    }
    return (
      <td key={el.name} className="table__column">
        <EndpointInput {...{ ...el, onChange, edit }} value={newEndpointState[el.name]} />
      </td>
    );
  });

  const handleAddNewEndpoint = () => {
    if (data.endpoints === null) {
      setVrf((prev) => ({
        ...prev,
        data: { ...prev.data, endpoints: [endpoints] }
      }));
      setSend(true);
      handleActiveEdit();
      return setEndpoint(endpoint);
    }
    if (endpoints.psk !== '') {
      setVrf((prev) => ({
        ...prev,
        data: { ...prev.data, endpoints: [...prev.data.endpoints, endpoints] }
      }));
      setSend(true);
      handleActiveEdit();
      return setEndpoint(endpoint);
    }
  };
  const handleSendEndpoint = () => {
    putVrfData(data.id, data);
  };

  useEffect(() => {
    if (send) {
      handleSendEndpoint();
      setSend(false);
    }
  }, [send]);

  return { displayEndpoint, disabled, edit, onClick, handleAddNewEndpoint, handleActiveEdit, handleDelete };
};
