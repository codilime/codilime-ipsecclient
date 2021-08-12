import React, { useState } from 'react';
import { EndpointInput } from 'common';
import { endpointInputSchema } from 'db';

export const useEndpointLogic = (data, active) => {
  const [endpoint, setEndpoint] = useState(data);

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

  const displayEndpoint = endpointInputSchema.map((el) => {
    if (el.type === 'checkbox') {
      return (
        <td key={el.name} className="table__column">
          <EndpointInput {...{ ...el, onClick }} value={endpoint[el.name]} />
          <span className='endpointOption__span'>Active</span>
        </td>
      );
    } else
      return (
        <td key={el.name} className="table__column">
          <EndpointInput {...{ ...el, onChange, active }} value={endpoint[el.name]} />
        </td>
      );
  });

  return { displayEndpoint, active, onClick };
};
