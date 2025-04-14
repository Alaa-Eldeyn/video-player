declare module 'hls.js' {
    export default class Hls {
      static isSupported(): boolean;
      
      constructor(config?: any);
      
      loadSource(source: string): void;
      attachMedia(media: HTMLMediaElement): void;
      on(event: string, callback: (event: string, data: any) => void): void;
      destroy(): void;
      
      levels: Array<{
        height: number;
        width: number;
        bitrate: number;
        name: string;
        url: string;
      }>;
      
      currentLevel: number;
      autoLevelEnabled: boolean;
      
      static Events: {
        MANIFEST_PARSED: string;
        LEVEL_SWITCHED: string;
        [key: string]: string;
      };
    }
  }