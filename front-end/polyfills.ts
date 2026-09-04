import { registerGlobals } from '@livekit/react-native';

// Polyfill DOMException for React Native if it's not already available
if (typeof global.DOMException === 'undefined') {
  global.DOMException = class DOMException extends Error {
    constructor(message?: string, name?: string) {
      super(message);
      this.name = name ?? 'DOMException';
    }
  } as any;
}

registerGlobals();
