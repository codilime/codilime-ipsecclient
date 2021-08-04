import * as yup from 'yup';

export const vrfSchema = yup.object().shape({
    client_name: yup.string().min(5, 'Name should consist of at least 5 characters').max(28, 'Name should consist of maximum 28 characters').required('Please provide valid name for VRF'),
    lan_ip: yup.string().min(5, 'Mask name should consist of at least 5 characters'). max(10, 'Mask name should consist of at maximum 10 characters').required('Please provide valid name for Mask'),
})


// client_name: vrfName,
//     lan_ip: lanIpMask,
//     active: active,
//     vlan: parseInt(vlanValue, 10),
//     crypto_ph1: [cryptoPh1_1, cryptoPh1_2, cryptoPh1_3],
//     crypto_ph2: [cryptoPh2_1, cryptoPh2_2, cryptoPh2_3],
//     physical_interface: physicalInterface,
//     hardware_support: hardwareSupport,
//     local_as: parseInt(bgpValue, 10),
//     endpoints: detailVrf.endpoints