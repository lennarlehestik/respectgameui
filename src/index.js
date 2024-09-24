import React from 'react';
import ReactDOM from 'react-dom/client';
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import theme from './theme';
import './index.css';
import { PrivyProvider } from '@privy-io/react-auth';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <PrivyProvider
    appId="clzo7dteo03cnwpq0foz6wknh"
    config={{
      loginMethods: ['email', 'wallet'],
      appearance: {
        theme: 'light',
        accentColor: '#676FFF',
        logo: 'https://static.vecteezy.com/system/resources/thumbnails/024/485/573/small/respect-rubber-stamp-seal-vector.jpg',
      },
      embeddedWallets: {
        createOnLogin: 'all',
      },
    }}
  >
    <CssVarsProvider theme={theme}>
      <CssBaseline />
      <App />
    </CssVarsProvider>
  </PrivyProvider>
);