exports.config = {
  seleniumAddress: 'http://localhost:4444/wd/hub',
  realtimeFailure: true,
  specs: ['spec/*.js'],
  capabilities: {
    browserName: 'firefox'
  }
}
