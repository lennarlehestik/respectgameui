import React from 'react';
import ReactDOM from 'react-dom/client';
import { goerli, base } from 'viem/chains';
import { PrivyProvider } from '@privy-io/react-auth';
import { ZeroDevProvider } from '@zerodev/privy';
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import theme from './theme';
import App from './App';
import { AuthProvider } from './AuthProvider';
import './index.css';

const PRIVY_APP_ID = 'clzo7dteo03cnwpq0foz6wknh';
const ZERODEV_PROJECT_ID = 'a1511783-a97b-4114-9d91-c86b20673729';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <ZeroDevProvider projectId={ZERODEV_PROJECT_ID}>
      <PrivyProvider
        appId={PRIVY_APP_ID}
        config={{
          loginMethods: ['email'],
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
          supportedChains: [base]
        }}
      >
        <AuthProvider>
          <CssVarsProvider theme={theme}>
            <CssBaseline />
            <App />
          </CssVarsProvider>
        </AuthProvider>
      </PrivyProvider>
    </ZeroDevProvider>
);