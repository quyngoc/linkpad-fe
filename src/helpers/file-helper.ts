import _ from 'lodash'

export const fileHelpers = {
  getApiFileUrl: (model: any) => {
    if (typeof model === 'string') {
      if (model.length && model[0] === '/') model = model.substring(1)
      return process.env.VUE_APP_API_ENDPOINT! + model
    } else if (_.get(model, 'url')) {
      let url = _.get(model, 'url')
      if (url.length && url[0] === '/') url = url.substring(1)
      return process.env.VUE_APP_API_ENDPOINT! + url
    } else {
      return null
    }
  }
}
