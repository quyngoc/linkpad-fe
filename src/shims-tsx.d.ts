import Vue, { VNode } from 'vue'

declare global {
  namespace JSX {
    // tslint:disable no-empty-interface
    interface Element extends VNode {}
    // tslint:disable no-empty-interface
    interface ElementClass extends Vue {}
    interface IntrinsicElements {
      [elem: string]: any
    }
  }

  interface Window {
    ethereum: {
      isMetaMask: true
      request: (...args: any[]) => Promise<any>
    }
  }

  interface Number {
    noExponents(): string
  }
}
