import { Disposable, Uri, workspace } from 'coc.nvim'
import { IServiceContainer } from '../ioc/types'
import { ICommandResult, JediProxy, JediProxyHandler } from '../providers/jediProxy'

export class JediFactory implements Disposable {
  private disposables: Disposable[]
  private jediProxyHandlers: Map<string, JediProxyHandler<ICommandResult>>

  constructor(private extensionRootPath: string, private serviceContainer: IServiceContainer) {
    this.disposables = []
    this.jediProxyHandlers = new Map<string, JediProxyHandler<ICommandResult>>()
  }

  public dispose() {
    this.disposables.forEach(disposable => disposable.dispose())
    this.disposables = []
  }

  public getJediProxyHandler<T extends ICommandResult>(resource?: Uri): JediProxyHandler<T> {
    let workspacePath = workspace.rootPath
    if (!this.jediProxyHandlers.has(workspacePath)) {
      const jediProxy = new JediProxy(this.extensionRootPath, workspacePath, this.serviceContainer)
      const jediProxyHandler = new JediProxyHandler(jediProxy)
      this.disposables.push(jediProxy, jediProxyHandler)
      this.jediProxyHandlers.set(workspacePath, jediProxyHandler)
    }
    // tslint:disable-next-line:no-non-null-assertion
    return this.jediProxyHandlers.get(workspacePath)! as JediProxyHandler<T>
  }
}
