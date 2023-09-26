export const promiseHelper = {
  delay: (miniseconds: number) => new Promise(resolve => setTimeout(resolve, miniseconds))
}
