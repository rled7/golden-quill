import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import GoldenQuill from './App.jsx';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoldenQuill />
  </React.StrictMode>
);

reportWebVitals();