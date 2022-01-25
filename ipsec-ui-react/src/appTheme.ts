/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

interface ThemeType {
  dark: any;
  light: any;
  common?: any;
}
export const Theme: ThemeType = {
  dark: {
    color: 'dark',
    backgroundColor: 'black',
    borderColor: 'test'
  },
  light: {
    color: 'red',
    backgroundColor: 'blue',
    borderColor: 'abecadlo'
  },
  common: {
    transition: 'all 1s easy'
  }
};
