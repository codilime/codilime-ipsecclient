/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import { useFetchData, useAppContext } from 'hooks/';
import { StatusState, StatusMessage } from 'interface/enum';

export const useInitData = () => {
  const { fetchData, fetchCertsData, fetchErrorData, fetchSourceData, fetchAppVersion, fetchSystemName } = useFetchData();
  const {
    context: { loading },
    setContext
  } = useAppContext();

  const setVrfData = async () => {
    const { vrf } = await fetchData();
    if (!vrf) return;
    setContext((prev) => ({ ...prev, vrf }));
  };

  const setCerts = async () => {
    const { ca } = await fetchCertsData();
    if (!ca) return;
    setContext((prev) => ({ ...prev, certificates: ca }));
  };
  const setNotification = async () => {
    const { error } = await fetchErrorData();
    if (!error) return;
    setContext((prev) => ({ ...prev, notifications: error }));
  };

  const setSourceList = async () => {
    const { source_interface } = await fetchSourceData();
    if (source_interface) {
      setContext((prev) => ({ ...prev, sourceInterface: source_interface }));
    }
  };

  const setSystemName = async () => {
    const { setting } = await fetchSystemName();
    if (setting) setContext((prev) => ({ ...prev, switchVersion: setting.value }));
  };

  const setAppVersion = async () => {
    const { setting } = await fetchAppVersion();
    if (setting) setContext((prev) => ({ ...prev, version: setting.value }));
  };

  const InitData = () => {
    try {
      setCerts();
      setNotification();
      setSourceList();
      setAppVersion();
      setSystemName();
    } catch (err: any) {
      setContext((prev) => ({ ...prev, actionStatus: [{ status: StatusState.error, message: StatusMessage.failedFetch }] }));
    }
  };

  return { setVrfData, InitData, loading };
};
