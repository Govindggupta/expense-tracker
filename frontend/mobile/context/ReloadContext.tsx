import React, { createContext, useState } from 'react';

type ReloadContextType = {
  reload: boolean;
  triggerReload: () => void;
};

export const ReloadContext = createContext<ReloadContextType>({
  reload: false,
  triggerReload: () => {},
});

export const ReloadProvider = ({ children }: { children: React.ReactNode }) => {
  const [reload, setReload] = useState(false);

  const triggerReload = () => {
    setReload(true);
    setTimeout(() => {
      setReload(false);
    }, 2000);
  };

  return (
    <ReloadContext.Provider value={{ reload, triggerReload }}>{children}</ReloadContext.Provider>
  );
};
