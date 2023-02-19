import { AppConfig, ChainFactory } from ".";
export declare namespace AppConfigs {
  const MainNet: () => AppConfig;
  const TestNet: () => AppConfig;
  const Staging: () => AppConfig;
}
export declare namespace ChainFactories {
  const MainNet: () => Promise<ChainFactory>;
  const TestNet: () => Promise<ChainFactory>;
  const Staging: () => Promise<ChainFactory>;
}
//# sourceMappingURL=config.d.ts.map
