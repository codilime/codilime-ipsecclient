import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';

const title = 'Mockup of IPSec';

ReactDOM.render(
    <App title={title} />
    <div>{title}</div>,
    document.getElementById('app')
);

module.hot.accept();