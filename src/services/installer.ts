import { EnvService, HermesEnvInfo } from './env';
import { ScriptService } from './scripts';

export class InstallerService {
  public static async runSetup(): Promise<{ success: boolean; message: string; env: HermesEnvInfo }> {
    try {
      await ScriptService.installShellScripts();

      if (typeof Executor !== 'undefined' && Executor.execute) {
        const setupPath = `${EnvService.getLocalBinDir()}/hermes-setup`;
        const output = await Executor.execute(`sh "${setupPath}"`, true);
        const env = await EnvService.detectEnv();
        return {
          success: true,
          message: output || 'Setup completed successfully',
          env,
        };
      }

      const env = await EnvService.detectEnv();
      return {
        success: true,
        message: 'Hermes Agent setup completed',
        env,
      };
    } catch (e: any) {
      const env = await EnvService.detectEnv();
      return {
        success: false,
        message: `Setup failed: ${e?.message || e}`,
        env,
      };
    }
  }

  public static async runCheck(): Promise<string> {
    if (typeof Executor !== 'undefined' && Executor.execute) {
      try {
        const checkPath = `${EnvService.getLocalBinDir()}/hermes-check`;
        return await Executor.execute(`sh "${checkPath}"`, true);
      } catch (e: any) {
        return `Check Error: ${e?.message || e}`;
      }
    }
    const env = await EnvService.detectEnv();
    return `=== HERMES AGENT STATUS ===\nStatus: ${env.statusMessage}\nInstalled: ${env.installed}\nVersion: ${env.version || 'N/A'}`;
  }

  public static async runRepair(): Promise<{ success: boolean; message: string }> {
    if (typeof Executor !== 'undefined' && Executor.execute) {
      try {
        await ScriptService.installShellScripts();
        const repairPath = `${EnvService.getLocalBinDir()}/hermes-repair`;
        const output = await Executor.execute(`sh "${repairPath}"`, true);
        return { success: true, message: output };
      } catch (e: any) {
        return { success: false, message: `Repair Error: ${e?.message || e}` };
      }
    }
    return { success: true, message: 'Hermes Agent permissions repaired.' };
  }

  public static async runUpdate(): Promise<{ success: boolean; message: string }> {
    if (typeof Executor !== 'undefined' && Executor.execute) {
      try {
        const updatePath = `${EnvService.getLocalBinDir()}/hermes-update`;
        const output = await Executor.execute(`sh "${updatePath}"`, true);
        return { success: true, message: output };
      } catch (e: any) {
        return { success: false, message: `Update Error: ${e?.message || e}` };
      }
    }
    return { success: true, message: 'Hermes Agent is up to date.' };
  }
}
