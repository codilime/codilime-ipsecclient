# IpsecUi

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.2.9.

## Setup

Install node and npm. The recommended method for this is using [Node Version Manager](https://github.com/nvm-sh/nvm).
1. Follow the instructions in the README in their repo.
2. Install latest stable version of node and npm: `nvm install --lts && nvm use --lts`
3. Install angular cli globally: `npm install -g @angular/cli`
4. Install dependency modules: `cd ipsec-ui && npm install`
5. You should be ready to run the UI server

The angular development server is configured to proxy API calls to `http://localhost:8000`. Make sure that the backend is running to answer the requests.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.
