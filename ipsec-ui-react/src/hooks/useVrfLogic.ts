/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import { useFetchData, useGetLocation, useAppContext } from 'hooks/';

export const useVrfLogic = () => {
  const { context } = useAppContext();
  const { deleteVrfData } = useFetchData();
  const { history } = useGetLocation();

  const {
    data: { client_name, id, endpoint },
    hardware,
    error,
    success,
    sourceInterface
  } = context;

  const handleDelete = () => {
    if (!id) return;
    deleteVrfData(id);
    history.push('/vrf/create');
  };
  return { context, client_name, error, vrf_id: id, hardware, success, endpoint, sourceInterface, handleDelete };
};
