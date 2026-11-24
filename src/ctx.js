import React from 'react';
export const ThemeCtx = React.createContext({ theme: 'light', setTheme: () => {} });
export const SearchCtx = React.createContext({ openSearch: () => {} });
export const RouteCtx = React.createContext('overview');

export const DemoCtx = React.createContext(null);

export const DEMO_INCIDENT_TRANSITIONS = {
  detected: ['acknowledged'],
  acknowledged: ['reported'],
  reported: ['on_hold', 'resolved'],
  on_hold: ['resolved'],
  resolved: [],
};
