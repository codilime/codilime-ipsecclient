/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import { MouseEvent, useState } from 'react';

export const useModalLogic = () => {
  const [show, setShow] = useState(false);

  const handleToggleModal = () => setShow((prev) => !prev);

  const stopPropagation = (e: MouseEvent<HTMLDivElement>) => e.stopPropagation();

  return { show, handleToggleModal, stopPropagation };
};
