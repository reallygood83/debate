'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type DebateContextType = {
  activeTopic: string;
  setActiveTopic: (topic: string) => void;
  isDebateActive: boolean;
  setIsDebateActive: (isActive: boolean) => void;
};

const defaultContext: DebateContextType = {
  activeTopic: '초등학교에 휴대폰을 가지고 와야 한다',
  setActiveTopic: () => {},
  isDebateActive: false,
  setIsDebateActive: () => {},
};

const DebateContext = createContext<DebateContextType>(defaultContext);

export const useDebate = () => useContext(DebateContext);

export const DebateProvider = ({ children }: { children: ReactNode }) => {
  const [activeTopic, setActiveTopic] = useState(defaultContext.activeTopic);
  const [isDebateActive, setIsDebateActive] = useState(defaultContext.isDebateActive);

  return (
    <DebateContext.Provider
      value={{
        activeTopic,
        setActiveTopic,
        isDebateActive,
        setIsDebateActive,
      }}
    >
      {children}
    </DebateContext.Provider>
  );
}; 