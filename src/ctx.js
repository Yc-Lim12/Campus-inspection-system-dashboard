import React from 'react';
export const ThemeCtx = React.createContext({ theme: 'light', setTheme: () => {} });
export const SearchCtx = React.createContext({ openSearch: () => {} });
export const RouteCtx = React.createContext('overview');
