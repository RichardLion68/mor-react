import React from 'react';
import { createRoot } from 'react-dom/client';
import './data/base.css';
import './data/story.css';
import './shell.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(<App />);