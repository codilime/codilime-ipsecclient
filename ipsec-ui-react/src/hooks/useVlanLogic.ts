import { useState, useEffect, ChangeEvent } from 'react';
import { useAppContext } from 'hooks/';

interface vlanInterface {
  vlan: number;
  lan_ip: string;
}

export const useVlanLogic = (setValue: any, reset: any) => {
  const {
    vrf: { data }
  } = useAppContext();

  const [error, setError] = useState(false);
  const [vlan, setVlan] = useState<vlanInterface[] | []>([]);
  const [vlanInterface, setVlanInterface] = useState<vlanInterface>({ vlan: 0, lan_ip: '' });

  const checkLanIpValue = (value: string) => {
    const arrayOfValue = value.split('.');
    const validateIP = arrayOfValue.reduce((total: string[], value) => {
      if (parseInt(value) > 255 || parseInt(value) < 0) {
        return [...total, value];
      }
      if (value.includes('/')) {
        const mask = value.split('/');

        if (parseInt(mask[0]) > 255 || parseInt(mask[0]) < 0) {
          return [...total, value];
        }
        if (parseInt(mask[1]) > 32 || parseInt(mask[1]) < 0) {
          return [...total, value];
        }
      }
      return [...total];
    }, []);

    return !validateIP.length && arrayOfValue.length === 4 ? false : true;
  };

  useEffect(() => {
    if (data.vlans) {
      setVlan(data.vlans);
    }
  }, [data]);

  useEffect(() => {
    if (error) setError(false);
  }, [vlan]);

  const handleChangeInputValue = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'vlan') {
      return setVlanInterface((prev) => ({ ...prev, vlan: parseInt(value) }));
    }
    setVlanInterface((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddNewVlan = () => {
    const validate = checkLanIpValue(vlanInterface.lan_ip);
    if (validate || vlanInterface.vlan <= 1) return setError(true);
    setVlanInterface({ vlan: 0, lan_ip: '' });
    reset({ ...data, vlans: [] });
    setVlan((prev) => [...prev, vlanInterface]);
    setValue('vlans', [...vlan, vlanInterface]);
  };

  const handleDeleteVlan = (value: number) => {
    const newVlan = vlan.filter((el) => el.vlan !== value);
    setVlan(newVlan);
    reset({ ...data, vlans: [] });
    setValue('vlans', [...newVlan]);
  };

  return { vlan, vlanInterface, error, handleAddNewVlan, handleDeleteVlan, handleChangeInputValue };
};
