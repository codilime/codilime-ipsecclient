import * as yup from 'yup';
import { maxValueForLocalAS } from '../constants';

export const vrfSchema = yup.object().shape({
  client_name: yup.string().min(5, 'Name should consist of at least 5 characters').max(28, 'Name should consist of maximum 28 characters').required('Please provide valid name for VRF'),
  active: yup.boolean().required(),
  local_as: yup
    .number()
    .min(1, 'BGP Local AS must be greater than 1')
    .max(maxValueForLocalAS, 'BGP Local AS must not exceed ' + maxValueForLocalAS)
    .integer('Please provide integer'),
  endpoint: yup.array(),
  vlan: yup.array(),
  crypto_ph1: yup.string(),
  crypto_ph2: yup.string()
});

export const newLoginSchema = yup.object().shape({
  password: yup.string().min(8, 'Your new password have to at least 8 chars').required(),
  newPasswordConfirmation: yup
    .string()
    .required()
    .oneOf([yup.ref('password'), null], 'Password and Confirm must be the same')
});

export const restConfSchema = yup.object().shape({
  switch_username: yup.string().min(5).required(),
  switch_password: yup.string().min(8).required()
});
