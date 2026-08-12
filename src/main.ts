import { TerminalService } from './services/terminal';
import { InstallerService } from './services/installer';
import { ScriptService } from './services/scripts';
import { StatusDialog } from './ui/statusDialog';

const PLUGIN_ID = 'com.acode.hermes';

const COMMAND_NAMES = [
  'Hermes: Launch Agent',
  'Hermes: Setup Wizard',
  'Hermes: Status Check',
  'Hermes: Repair',
  'Hermes: Update',
  'Hermes: Show Environment',
];

class AcodeHermesPlugin {
  private baseUrl: string = '';
  private $page: any = null;

  public async init(baseUrl: string, $page: any, cache: any): Promise<void> {
    this.baseUrl = baseUrl;
    this.$page = $page;

    await ScriptService.installShellScripts();

    const commandsApi = acode.require('commands');
    if (commandsApi) {
      commandsApi.addCommand({
        name: 'Hermes: Launch Agent',
        description: 'Launch Nous Research Hermes Agent CLI in Acode Terminal',
        bindKey: { win: 'Ctrl-Alt-H', mac: 'Command-Alt-H' },
        exec: () => {
          TerminalService.launchInTerminal();
        },
      });

      commandsApi.addCommand({
        name: 'Hermes: Setup Wizard',
        description: 'Run setup wizard for Hermes Agent',
        exec: () => {
          TerminalService.launchInTerminal(undefined, 'setup');
        },
      });

      commandsApi.addCommand({
        name: 'Hermes: Status Check',
        description: 'Check status and integrity of Hermes Agent',
        exec: async () => {
          const report = await InstallerService.runCheck();
          const alertApi = acode.require('alert');
          if (alertApi) {
            await alertApi('Hermes Status Check', report);
          } else {
            alert(report);
          }
        },
      });

      commandsApi.addCommand({
        name: 'Hermes: Repair',
        description: 'Repair dependencies for Hermes Agent',
        exec: async () => {
          const res = await InstallerService.runRepair();
          if (typeof acode.pushNotification === 'function') {
            acode.pushNotification('Hermes Repair', res.message, { type: res.success ? 'success' : 'error' });
          }
        },
      });

      commandsApi.addCommand({
        name: 'Hermes: Update',
        description: 'Check and update Hermes Agent',
        exec: async () => {
          const res = await InstallerService.runUpdate();
          if (typeof acode.pushNotification === 'function') {
            acode.pushNotification('Hermes Update', res.message, { type: res.success ? 'success' : 'error' });
          }
        },
      });

      commandsApi.addCommand({
        name: 'Hermes: Show Environment',
        description: 'Show Hermes Agent status dialog and actions',
        exec: () => {
          StatusDialog.show();
        },
      });
    }

    if (typeof acode.pushNotification === 'function') {
      acode.pushNotification('Acode Hermes Agent', 'Plugin loaded. Run "hermes" in terminal to start!', {
        type: 'info',
        autoClose: true,
      });
    }
  }

  public unmount(): void {
    const commandsApi = acode.require('commands');
    if (commandsApi) {
      for (const cmdName of COMMAND_NAMES) {
        try {
          commandsApi.removeCommand(cmdName);
        } catch (e) {
          // ignore
        }
      }
    }
  }
}

const pluginInstance = new AcodeHermesPlugin();

acode.setPluginInit(
  PLUGIN_ID,
  (baseUrl: string, $page: any, cache: any) => {
    pluginInstance.init(baseUrl, $page, cache);
  }
);

acode.setPluginUnmount(PLUGIN_ID, () => {
  pluginInstance.unmount();
});
