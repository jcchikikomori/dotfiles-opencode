import type { ProviderInfo, ModelsByProvider } from '../types.js';
export declare function selectProvider(providers: ProviderInfo, modelsByProvider: ModelsByProvider): Promise<string | undefined>;
export declare function confirmConfiguration(presetCount: number, preferredProvider?: string): Promise<boolean>;
//# sourceMappingURL=interactive.d.ts.map