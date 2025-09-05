export const logger = {
  debug: (message?: any, ...optionalParams: any[]) => {
    if (import.meta.env.VITE_APP_ENV === "production") {
      return;
    }
    console.log(message, ...optionalParams);
  },
};
