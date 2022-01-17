import * as yup from 'yup';

export const vrfSchema = yup.object().shape({
  client_name: yup.string().min(5, 'Name should consist of at least 5 characters').max(28, 'Name should consist of maximum 28 characters').required('Please provide valid name for VRF'),
  active: yup.boolean(),
  local_as: yup.number(),
  endpoint: yup.array(),
  vlan: yup.array().min(1),
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
  switch_username: yup.string().min(5).required(),
  switch_password: yup.string().min(8).required()
});
