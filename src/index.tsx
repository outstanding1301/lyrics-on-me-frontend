import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';

import { Provider } from 'mobx-react';
import EditorStore from './stores/EditorStore';
import Editor from './components/Editor';

const editorStore = new EditorStore();

ReactDOM.render(
  <Provider store={editorStore}>
    <Editor />
  </Provider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
