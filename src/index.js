import React from 'react';
import ReactDOM from 'react-dom/client';
import { base } from 'viem/chains';
import { PrivyProvider } from '@privy-io/react-auth';
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import theme from './theme';
import App from './App';
import { AuthProvider } from './AuthProvider';
import './index.css';

const PRIVY_APP_ID = 'clzo7dteo03cnwpq0foz6wknh';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <PrivyProvider
    appId={PRIVY_APP_ID}
    onSuccess={() => console.log('Success!')}
    config={{
      loginMethods: ['email', 'wallet'],
      appearance: {
        theme: 'light',
        accentColor: '#676FFF',
        logo: 'https://static.vecteezy.com/system/resources/thumbnails/024/485/573/small/respect-rubber-stamp-seal-vector.jpg',
      },
      embeddedWallets: {
        createOnLogin: 'users-without-wallets',
        requireUserPasswordOnCreate: false
      },
      defaultChain: base,
      supportedChains: [base],
      walletConnectors: [
        { name: 'metamask' },
        { name: 'walletConnect' },
        { name: 'coinbaseWallet' }
      ]
    }}
  >
    <AuthProvider>
      <CssVarsProvider theme={theme}>
        <CssBaseline />
        <App />
      </CssVarsProvider>
    </AuthProvider>
  </PrivyProvider>
);