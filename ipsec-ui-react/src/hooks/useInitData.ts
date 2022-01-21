import { useFetchData, useAppContext } from 'hooks/';
import { VrfDataTypes, NotificationsType, CertificatesType } from 'interface/index';
import { useState, useLayoutEffect } from 'react';

interface InitDataType {
  vrf: VrfDataTypes[] | [];
  notifications: NotificationsType[] | [];
  certificates: CertificatesType[] | [];
  sourceInterface: string[];
}

export const useInitData = () => {
  const { fetchData, fetchCertsData, fetchErrorData, fetchSourceData } = useFetchData();

  const {
    context: { loading },
    setContext
  } = useAppContext();

  const fetchVrfData = async () => {
    const { vrf } = await fetchData();
    if (!vrf) return;
    setContext((prev) => ({ ...prev, vrf }));
  };

  const fetchCerts = async () => {
    const { ca } = await fetchCertsData();
    if (!ca) return;
    setContext((prev) => ({ ...prev, certificates: ca }));
  };
  const fetchNotification = async () => {
    const { error } = await fetchErrorData();
    if (!error) return;
    setContext((prev) => ({ ...prev, notifications: error }));
  };

  const fetchSourceList = async () => {
    const { source_interface } = await fetchSourceData();
    if (source_interface) {
      setContext((prev) => ({ ...prev, sourceInterface: source_interface }));
    }
  };

  return { fetchVrfData, fetchCerts, fetchNotification, fetchSourceList, loading };
};
