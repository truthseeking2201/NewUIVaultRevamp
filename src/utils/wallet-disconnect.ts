type DisconnectHandler = () => void;

let disconnectHandler: DisconnectHandler | null = null;

export const setWalletDisconnectHandler = (handler: DisconnectHandler) => {
  disconnectHandler = handler;
};

export const triggerWalletDisconnect = () => {
  if (disconnectHandler) {
    disconnectHandler();
  }
};

export const clearWalletDisconnectHandler = () => {
  disconnectHandler = null;
};
