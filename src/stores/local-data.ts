export class LocalData {
  set lightmode(enable: boolean) {
    if (enable) {
      localStorage.setItem('lightmode', 'enable')
    } else {
      localStorage.removeItem('lightmode')
    }
  }

  get lightmode() {
    return !!localStorage.getItem('lightmode')
  }
}

export const localData = new LocalData()
