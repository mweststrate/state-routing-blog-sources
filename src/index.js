import React from 'react';
import ReactDOM from 'react-dom';
import ViewStore from './store/ViewStore';
import { startRouter } from './store/router';
import { simpleFetch } from './store/fetch';

import { App } from './components/App';

// Prepare DOM (normally you would do this in HTML, but this simplifies webpack setup)
const root = document.createElement('div');
root.id = 'app';
document.body.appendChild(root);

// Prepare viewStore
const viewStore = new ViewStore(simpleFetch);
startRouter(viewStore)

ReactDOM.render(
  <App store= { viewStore } />,
  document.querySelector('#app')
);
