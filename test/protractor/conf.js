exports.config = {
  seleniumAddress: 'http://localhost:4444/wd/hub',
  realtimeFailure: true,
  specs: ['sel_spec.js', 'std_spec.js'],
  capabilities: {
    browserName: 'firefox'
  }
}
