// src/context/SidebarContext.js
// Controls the visibility of the people/messaging sidebar

import React, { createContext, useCallback, useContext, useState } from 'react';
import PropTypes from 'prop-types';

const SidebarContext = createContext(null);

export function SidebarProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingContact, setPendingContact] = useState(null);

  const openSidebar = useCallback(() => setIsOpen(true), []);
  const closeSidebar = useCallback(() => setIsOpen(false), []);
  const toggleSidebar = useCallback(() => setIsOpen((v) => !v), []);

  const openWithContact = useCallback((contact) => {
    setPendingContact(contact);
    setIsOpen(true);
  }, []);

  const clearPendingContact = useCallback(() => setPendingContact(null), []);

  return (
    <SidebarContext.Provider value={{ isOpen, openSidebar, closeSidebar, toggleSidebar, openWithContact, pendingContact, clearPendingContact }}>
      {children}
    </SidebarContext.Provider>
  );
}

SidebarProvider.propTypes = { children: PropTypes.node.isRequired };

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used within a SidebarProvider');
  return ctx;
}
