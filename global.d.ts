declare global {
  interface Window {
    innerBaseUrl: string
    openai: any
  }
  interface WindowEventMap {
    [SET_GLOBALS_EVENT_TYPE]: SetGlobalsEvent
  }
}

export {}
