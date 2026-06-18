import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootNode = globalThis.document.querySelector('#root') as HTMLElement;
ReactDOM.createRoot(rootNode).render(<App />);
