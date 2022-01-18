import { useState, useEffect, ChangeEvent, useLayoutEffect } from 'react';
import { useFieldArray, Control } from 'react-hook-form';
import { useAppContext } from 'hooks/';
import { VlanInterface, VrfDataTypes } from 'interface/index';

export const useVlanLogic = (control: Control<VrfDataTypes>) => {
  const {
    context: { data }
  } = useAppContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'vlan'
  });

  const [error, setError] = useState(false);
  const [vlan, setVlan] = useState<VlanInterface[] | []>([]);
  const [vlanInterface, setVlanInterface] = useState<VlanInterface>({ vlan: 0, lan_ip: '' });

  const checkLanIpValue = (value: string) => {
    const ipv4_regex = /^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}$/;
    const ipv6_regex =
      /^(?:(?:[a-fA-F\d]{1,4}:){7}(?:[a-fA-F\d]{1,4}|:)|(?:[a-fA-F\d]{1,4}:){6}(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|:[a-fA-F\d]{1,4}|:)|(?:[a-fA-F\d]{1,4}:){5}(?::(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,2}|:)|(?:[a-fA-F\d]{1,4}:){4}(?:(?::[a-fA-F\d]{1,4}){0,1}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,3}|:)|(?:[a-fA-F\d]{1,4}:){3}(?:(?::[a-fA-F\d]{1,4}){0,2}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,4}|:)|(?:[a-fA-F\d]{1,4}:){2}(?:(?::[a-fA-F\d]{1,4}){0,3}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,5}|:)|(?:[a-fA-F\d]{1,4}:){1}(?:(?::[a-fA-F\d]{1,4}){0,4}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,6}|:)|(?::(?:(?::[a-fA-F\d]{1,4}){0,5}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,7}|:)))(?:%[0-9a-zA-Z]{1,})?$/;

    const ipValue = value.split('/')[0];

    if (ipv4_regex.test(ipValue)) {
      const mask = value.split('/')[1];
      if (!mask) return false;
      if (parseInt(mask) > 32 || parseInt(mask) < 0) return false;
      return true;
    } else if (ipv6_regex.test(ipValue)) {
      const mask = value.split('/')[1];
      if (!mask) return false;
      if (parseInt(mask) > 128 || parseInt(mask) < 0) return false;
      return true;
    }
    return false;
  };

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
    if (!validate || vlanInterface.vlan <= 0) return setError(true);
    setVlanInterface({ vlan: 0, lan_ip: '' });
    append(vlanInterface);
  };

  const handleDeleteVlan = (index: number) => remove(index);

  return { vlan, vlanInterface, error, fields, handleAddNewVlan, handleDeleteVlan, handleChangeInputValue };
};
