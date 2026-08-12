import { ScriptService } from './scripts';

export class TerminalService {
  public static async launchInTerminal(workingDir?: string, mode?: string): Promise<boolean> {
    try {
      await ScriptService.installShellScripts();

      const terminalAPI = acode.require('terminal');
      if (!terminalAPI) {
        if (typeof acode.pushNotification === 'function') {
          acode.pushNotification('Hermes Agent', 'Acode Terminal API is unavailable', { type: 'error' });
        }
        return false;
      }

      let dir = workingDir;
      if (!dir && typeof editorManager !== 'undefined' && editorManager?.activeFile?.location) {
        dir = editorManager.activeFile.location;
      }

      let termInst = null;
      if (typeof terminalAPI.createServer === 'function') {
        termInst = await terminalAPI.createServer({ name: 'Hermes Agent' });
      } else if (typeof terminalAPI.create === 'function') {
        termInst = await terminalAPI.create({ name: 'Hermes Agent', serverMode: true });
      }

      if (!termInst || !termInst.id) return false;

      await new Promise((res) => setTimeout(res, 500));

      let cmd = 'hermes\r';
      if (mode === 'setup') {
        cmd = 'hermes setup\r';
      } else if (mode === 'chat') {
        cmd = 'hermes chat\r';
      }

      if (dir) {
        cmd = `cd "${dir}" && ${cmd}`;
      }

      terminalAPI.write(termInst.id, cmd);

      if (typeof acode.pushNotification === 'function') {
        acode.pushNotification('Hermes Agent', 'Hermes Agent started in terminal', { type: 'success' });
      }
      return true;
    } catch (e: any) {
      console.error('Hermes terminal launch error:', e);
      return false;
    }
  }
}
