// src/navigation/navigationRef.js
// Global navigation ref — allows navigation from outside the React tree (e.g. sidebar overlay)

import { createRef } from 'react';

export const navigationRef = createRef();

export function navigate(name, params) {
  if (navigationRef.current?.isReady()) {
    navigationRef.current.navigate(name, params);
  }
}
