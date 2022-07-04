import config from '../build/config.js'
console.log('env', config)
export default {
  //   apiServer: 'http://43.134.102.124:3000',
  //   wssServer: 'ws://43.134.102.124:8000',
  apiServer:
    config.env === 'development'
      ? 'http://localhost:3000'
      : 'http://43.134.102.124:3000',
  wssServer:
    config.env === 'development'
      ? 'ws://localhost:8000'
      : 'ws://43.134.102.124:8000',
}
