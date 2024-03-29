/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import * as yup from 'yup';

export const vrfSchema = yup.object().shape({
  client_name: yup.string().min(5, 'Name should consist of at least 5 characters').max(28, 'Name should consist of maximum 28 characters').required('Please provide valid name for VRF'),
  active: yup.boolean(),
  local_as: yup.number(),
  endpoint: yup.array(),
  vlan: yup.array().min(1).required('There need at least one Vlan and Lan IP'),
  crypto_ph1: yup.string(),
  crypto_ph2: yup.string(),
  ospf: yup.boolean()
});

export const hardwareSchame = yup.object().shape({
  client_name: yup.string().min(5, 'Name should consist of at least 5 characters').max(28, 'Name should consist of maximum 28 characters').required('Please provide valid name for VRF'),
  active: yup.boolean(),
  local_as: yup.number(),
  endpoint: yup.array(),
  vlan: yup.array(),
  crypto_ph1: yup.string(),
  crypto_ph2: yup.string(),
  ospf: yup.boolean()
});

export const newLoginSchema = yup.object().shape({
  password: yup.string().min(8, 'Your new password have to at least 8 chars').required(),
  newPasswordConfirmation: yup
    .string()
    .required()
    .oneOf([yup.ref('password'), null], 'Password and Confirm must be the same')
});

export const restConfSchema = yup.object().shape({
  switch_username: yup.string(),
  switch_password: yup.string()
});
