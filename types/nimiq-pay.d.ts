declare global {
  interface Window {
    nimiq?: {
      listAccounts: () => Promise<string[] | { error: { type: string, message: string } }>
      sign: (message: string | { message: string, isHex?: boolean }) => Promise<{ publicKey: string, signature: string } | { error: { type: string, message: string } }>
      sendBasicTransactionWithData: (tx: {
        recipient: string
        value: number
        data: string
        fee?: number
        validityStartHeight?: number
      }) => Promise<string | { error: { type: string, message: string } }>
    }
  }
}

export {}

