import * as yup from 'yup';

import { maxValueForLocalAS, maxValueForVlan } from '../constants';

export const vrfSchema = yup.object().shape({
  client_name: yup.string().min(5, 'Name should consist of at least 5 characters').max(28, 'Name should consist of maximum 28 characters').required('Please provide valid name for VRF'),
  lan_ip: yup.string().min(5, 'Incorrect IP mask, should be xxx.xxx.xxx.xxx/yy').max(19, 'Incorrect IP mask, should be xxx.xxx.xxx.xxx/yy').required('Please provide valid value for LAN IP Mask'),
  active: yup.boolean(),
  endpoints: null,
  local_as: yup
    .number()
    .min(1, 'BGP Local AS must be greater than 1')
    .max(maxValueForLocalAS, 'BGP Local AS must not exceed ' + maxValueForLocalAS)
    .integer('Please provide integer'),
  vlan: yup
    .number()
    .min(1, 'VLAN must be greater than 1')
    .max(maxValueForVlan, 'VLAN must not exceed ' + maxValueForVlan)
    .integer('Please provide integer'),
  crypto_ph1: yup.array(),
  crypto_ph2: yup.array()
});

export const newLoginSchema = yup.object().shape({
  currentPassword: yup.string().min(5).required(),
  newPassword: yup.string().min(8, '').required(''),
  newPasswordConfirmation: yup
    .string()
    .required('')
    .oneOf([yup.ref('newPassword'), null], '')
});

export const restConfSchema = yup.object().shape({
  switch_username: yup.string().min(5).required(),
  switch_password: yup.string().min(8).required()
});
