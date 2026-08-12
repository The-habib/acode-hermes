import { EnvService, HermesEnvInfo } from '../services/env';
import { InstallerService } from '../services/installer';
import { TerminalService } from '../services/terminal';

export class StatusDialog {
  public static async show(): Promise<void> {
    const alertApi = acode.require('alert');
    const selectApi = acode.require('select');
    const loaderApi = acode.require('loader');

    if (loaderApi) loaderApi.show();
    const env: HermesEnvInfo = await EnvService.detectEnv();
    if (loaderApi) loaderApi.hide();

    const title = 'Hermes Agent Status';
    const message = `
=================================
  ACODE HERMES AGENT STATUS
=================================
Status: ${env.statusMessage}
Version: ${env.version || '0.19.0'}
Architecture: ${env.arch}
OS / Runtime: ${env.os} (${env.environment})
Hermes Binary: ${env.hermesPath}
Python: ${env.pythonVersion}
    `.trim();

    if (!selectApi) {
      if (alertApi) {
        await alertApi(title, message);
      } else {
        alert(`${title}\n\n${message}`);
      }
      return;
    }

    const action = await selectApi(title, [
      ['launch', '🚀 Launch Hermes Agent'],
      ['wizard', '🧙 Run Setup Wizard'],
      ['check', '🔍 Run Check Diagnostics'],
      ['repair', '🛠️ Run Repair'],
      ['update', '🔄 Run Update'],
      ['info', 'ℹ️ View Environment Details'],
    ]);

    if (!action) return;

    switch (action) {
      case 'launch':
        await TerminalService.launchInTerminal();
        break;

      case 'wizard':
        await TerminalService.launchInTerminal(undefined, 'setup');
        break;

      case 'check':
        if (loaderApi) loaderApi.show();
        const checkReport = await InstallerService.runCheck();
        if (loaderApi) loaderApi.hide();
        if (alertApi) {
          await alertApi('Hermes Check', checkReport);
        } else {
          alert(checkReport);
        }
        break;

      case 'repair':
        if (loaderApi) loaderApi.show();
        const repairRes = await InstallerService.runRepair();
        if (loaderApi) loaderApi.hide();
        if (alertApi) {
          await alertApi('Hermes Repair', repairRes.message);
        } else {
          alert(repairRes.message);
        }
        break;

      case 'update':
        if (loaderApi) loaderApi.show();
        const updateRes = await InstallerService.runUpdate();
        if (loaderApi) loaderApi.hide();
        if (alertApi) {
          await alertApi('Hermes Update', updateRes.message);
        } else {
          alert(updateRes.message);
        }
        break;

      case 'info':
        if (alertApi) {
          await alertApi(title, message);
        } else {
          alert(`${title}\n\n${message}`);
        }
        break;
    }
  }
}
