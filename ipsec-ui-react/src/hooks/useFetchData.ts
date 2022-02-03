/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import { client } from 'api/';
import { useAppContext } from 'hooks/';
import { StatusState, StatusMessage } from 'interface/enum';

export const useFetchData = () => {
  const { setContext } = useAppContext();

  const fetchData = async () => await client('vrf');

  const postVrfData = async (payload: any) => {
    try {
      setContext((prev) => ({ ...prev, loading: true }));
      const res = await client('vrf', { ...payload }, { method: 'POST' });
      if (!res) return setContext((prev) => ({ ...prev, loading: false, actionStatus: [...prev.actionStatus, { status: StatusState.error, message: StatusMessage.failedAdd }] }));
      setContext((prev) => ({ ...prev, loading: false, actionStatus: [...prev.actionStatus, { status: StatusState.success, message: StatusMessage.successAdd }] }));
      return res;
    } catch (err: any) {
      setContext((prev) => ({ ...prev, loading: false }));
    }
  };

  const patchVrfData = async (payload: any) => {
    try {
      setContext((prev) => ({ ...prev, loading: true }));
      const res = await client(`vrf=${payload.vrf.id}`, { ...payload }, { method: 'PATCH' });
      if (!res) {
        payload.vrf.active = false;
        await client(`vrf=${payload.vrf.id}`, { ...payload }, { method: 'PATCH' });
        return setContext((prev) => ({ ...prev, loading: false, actionStatus: [...prev.actionStatus, { status: StatusState.error, message: StatusMessage.failedUpdate }] }));
      }
      setContext((prev) => ({ ...prev, loading: false, actionStatus: [...prev.actionStatus, { status: StatusState.success, message: StatusMessage.successUpdate }] }));
      return res;
    } catch (err: any) {
      setContext((prev) => ({ ...prev, loading: false }));
    }
  };

  const deleteVrfData = async (id: number | string) => {
    try {
      setContext((prev) => ({ ...prev, loading: true }));
      const res = await client(`vrf=${id}`, {}, { method: 'DELETE' });
      if (res) setContext((prev) => ({ ...prev, loading: false, actionStatus: [...prev.actionStatus, { status: StatusState.success, message: StatusMessage.successDelete }] }));
    } catch (err) {
      setContext((prev) => ({ ...prev, loading: false, actionStatus: [...prev.actionStatus, { status: StatusState.error, message: StatusMessage.failedDelete }] }));
    }
  };

  const fetchEndpointStatus = async (id: number | string) => await client(`monitoring=${id}`);

  const fetchLogs = async () => await client('log');

  const fetchCertsData = async () => await client('ca');

  const fetchSystemName = async () => await client('setting=system_name');

  const fetchAppVersion = async () => await client('setting=app_version');

  const fetchSourceData = async () => await client('source-interface');

  const fetchErrorData = async () => await client('error');

  const fetchSwitchUsername = async () => await client('setting=switch_username');

  const fetchSwitchPassword = async () => await client('setting=switch_password');

  const fetchSwitchAddress = async () => await client('setting=switch_address');

  return {
    fetchData,
    postVrfData,
    deleteVrfData,
    patchVrfData,
    fetchEndpointStatus,
    fetchLogs,
    fetchCertsData,
    fetchSourceData,
    fetchSystemName,
    fetchAppVersion,
    fetchErrorData,
    fetchSwitchUsername,
    fetchSwitchPassword,
    fetchSwitchAddress
  };
};
