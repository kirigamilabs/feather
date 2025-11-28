export const trackEvent = (
  eventName: string, 
  properties?: Record<string, any>
) => {
  // Google Analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, properties);
  }

  // Mixpanel (if using)
  if (typeof window !== 'undefined' && (window as any).mixpanel) {
    (window as any).mixpanel.track(eventName, properties);
  }

  // Console log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Event:', eventName, properties);
  }
};

// Predefined events
export const analytics = {
  walletConnected: (address: string, chainId: number) =>
    trackEvent('wallet_connected', { address, chainId }),
  
  swapInitiated: (fromToken: string, toToken: string, amount: string) =>
    trackEvent('swap_initiated', { fromToken, toToken, amount }),
  
  swapCompleted: (txHash: string) =>
    trackEvent('swap_completed', { txHash }),
  
  aiMessageSent: (messageLength: number) =>
    trackEvent('ai_message_sent', { messageLength }),
  
  promptChanged: (promptId: string) =>
    trackEvent('prompt_changed', { promptId })
};