export default {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          browsers: ['Chrome >= 90', 'Firefox >= 88', 'Safari >= 14', 'Edge >= 90']
        },
        modules: false
      }
    ]
  ]
};