import { action, computed, observable } from 'mobx'

export class GlobalLoadingController {
  @observable numberRequests = 0

  constructor() {
    //
  }

  @action.bound increaseRequest() {
    this.numberRequests = this.numberRequests + 1
  }

  @action.bound decreaseRequest() {
    this.numberRequests = this.numberRequests - 1
  }

  @computed get requesting() {
    return this.numberRequests > 0
  }
}

export const loadingController = new GlobalLoadingController()
