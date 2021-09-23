module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: '14.17',
        },
      },
    ],
    '@babel/typescript',
  ],
  plugins: [
    '@babel/plugin-proposal-object-rest-spread',
    ['module-resolver', { root: ['./src'] }],
  ],
};
