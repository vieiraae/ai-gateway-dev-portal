import type { Configuration, PopupRequest } from '@azure/msal-browser';

export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID ?? '',
    authority: 'https://login.microsoftonline.com/organizations',
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'localStorage',
  },
  system: {
    allowRedirectInIframe: true,
  },
};

export const loginRequest: PopupRequest = {
  scopes: ['https://management.azure.com/user_impersonation'],
};

export const managementScope = 'https://management.azure.com/.default';
