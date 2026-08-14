declare module '@docusaurus/useGlobalData' {
  export function usePluginData(
    pluginName: string,
    pluginId?: string,
    options?: { failfast?: boolean },
  ): unknown;
}
