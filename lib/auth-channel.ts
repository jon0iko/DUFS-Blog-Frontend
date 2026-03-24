// This file should only be imported in client-side components.
// We are creating a broadcast channel for authentication events to sync across tabs.
export const authChannel = (typeof window !== 'undefined') ? new BroadcastChannel('auth') : null;
