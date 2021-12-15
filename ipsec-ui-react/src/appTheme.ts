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
