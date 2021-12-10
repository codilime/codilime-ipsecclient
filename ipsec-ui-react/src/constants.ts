export const maxValueForLocalAS = Math.pow(2, 32);
export const maxValueForVlan = 4094;
export const maxValueForRemoteAS = 4094;

export const newVrf = 'create';
export const HardwareId = '1';

export enum EndpointTableConst {
  nat = 'NAT',
  bgp = 'BGP',
  action = 'ACTION',
  remote = 'Remote AS',
  pskCertificates = 'PSK / Certificates'
}
