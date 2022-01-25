/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

export enum ThemeType {
  dark = 'dark',
  light = 'light'
}

export const newVrf = 'create';

export const HardwareId = '1';

export enum TopBarMenu {
  notice = 'notice',
  logs = 'logs',
  dropDown = 'dropDown'
}

export enum StatusState {
  error = 'Error State',
  success = 'Success State'
}

export enum StatusMessage {
  successAdd = 'Successful added a new data',
  failedAdd = 'Failed add a new data',
  successUpdate = 'Successful update data',
  failedUpdate = 'Failed update data',
  successDelete = 'Successful delete data',
  failedDelete = 'Failed delete data',
  failedFetch = "Fetch data isn't complete"
}

export enum SnackBarStatus {
  error = 'Error State',
  success = 'Success State'
}

export enum EndpointTableConst {
  nat = 'NAT',
  bgp = 'BGP',
  action = 'ACTION',
  remote = 'Remote AS',
  pskCertificates = 'PSK / Certificates'
}
