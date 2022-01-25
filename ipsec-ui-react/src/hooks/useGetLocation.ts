/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import { useLocation, useHistory } from 'react-router-dom';

export const useGetLocation = () => {
  const location = useLocation();
  const history = useHistory();

  const currentLocation = location.pathname.split('/vrf/')[1];

  return { currentLocation, history };
};
