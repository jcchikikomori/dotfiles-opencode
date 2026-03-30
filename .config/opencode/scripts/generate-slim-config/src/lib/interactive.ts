import { select, confirm } from '@inquirer/prompts';
import type { ProviderInfo, ModelsByProvider } from '../types.js';

export async function selectProvider(
  providers: ProviderInfo,
  modelsByProvider: ModelsByProvider
): Promise<string | undefined> {
  console.log('\n[Interactive Mode] Provider Selection\n');
  
  // Build choices with model counts
  const choices = providers.all.map(provider => {
    const models = modelsByProvider[provider];
    const totalModels = models 
      ? models.high.length + models.medium.length + models.low.length 
      : 0;
    
    const tierBreakdown = models
      ? `(H:${models.high.length} M:${models.medium.length} L:${models.low.length})`
      : '(no models)';
    
    return {
      name: `${provider} - ${totalModels} models ${tierBreakdown}`,
      value: provider,
      description: getProviderDescription(provider),
    };
  });
  
  // Add "No preference" option
  choices.push({
    name: 'No preference (use default priority)',
    value: 'none',
    description: 'Let the generator choose based on default provider priority',
  });
  
  const selectedProvider = await select({
    message: 'Select your preferred provider:',
    choices,
    default: providers.priority[0],
  });
  
  if (selectedProvider === 'none') {
    console.log('\n  ℹ Using default provider priority');
    return undefined;
  }
  
  // Show selected provider details
  const models = modelsByProvider[selectedProvider];
  if (models) {
    console.log(`\n  ✓ Selected: ${selectedProvider}`);
    console.log(`    High-tier models: ${models.high.length}`);
    console.log(`    Medium-tier models: ${models.medium.length}`);
    console.log(`    Low-tier models: ${models.low.length}`);
    
    if (models.high.length > 0) {
      console.log(`    Sample high-tier: ${models.high.slice(0, 2).map(m => m.name).join(', ')}`);
    }
  }
  
  // Confirm selection
  const confirmed = await confirm({
    message: `Use ${selectedProvider} as preferred provider?`,
    default: true,
  });
  
  if (!confirmed) {
    console.log('\n  Restarting provider selection...\n');
    return selectProvider(providers, modelsByProvider);
  }
  
  return selectedProvider;
}

function getProviderDescription(provider: string): string {
  const descriptions: Record<string, string> = {
    'github-copilot': 'GitHub Copilot - Best for coding, most reliable',
    'amazon-bedrock': 'Amazon Bedrock - Enterprise, Claude models',
    'google': 'Google AI - Gemini models',
    'openai': 'OpenAI - Direct OpenAI API',
    'anthropic': 'Anthropic - Claude models',
    'ollama': 'Ollama - Local models, free',
    'dmr': 'Docker Model Runner - Local containerized models',
  };
  
  return descriptions[provider] || 'Custom provider';
}

export async function confirmConfiguration(
  presetCount: number,
  preferredProvider?: string
): Promise<boolean> {
  console.log('\n[Configuration Summary]');
  console.log(`  Presets to generate: ${presetCount}`);
  console.log(`  Preferred provider: ${preferredProvider || 'default priority'}`);
  
  return confirm({
    message: 'Proceed with configuration generation?',
    default: true,
  });
}
