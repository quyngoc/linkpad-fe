import { action, observable } from 'mobx'

export interface AlertConfig {
  title?: string
  message?: string
  ok?: string
  persistent?: boolean
  callback?: (ok: boolean) => void
}

export class AlertController {
  @observable show = false
  @observable config: AlertConfig = {}

  constructor() {
    //
  }

  @action.bound changeShow(value: boolean) {
    this.show = value
  }

  @action info(title: string, message: string, ok = 'OK') {
    this.config = { title, message: message ? message : 'There is no information', ok, persistent: false }
    this.show = true
  }

  @action confirm(title: string, message: string, ok = 'OK'): Promise<boolean> {
    this.config = { title, message, ok, persistent: true }
    this.show = true
    return new Promise(resolve => {
      this.config.callback = ok => {
        resolve(ok)
      }
    })
  }

  confirmDelete(type: string): Promise<boolean> {
    return this.confirm('Confirm delete', `Confirm delete ${type}?`)
  }

  @action.bound ok() {
    this.show = false
    this.config.callback && this.config.callback(true)
  }

  @action.bound cancel() {
    this.show = false
    this.config.callback && this.config.callback(false)
  }
}

export const alertController = new AlertController()
