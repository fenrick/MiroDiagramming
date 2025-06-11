export default {
  transform: {
    '^.+\\.tsx?$': [
      'babel-jest',
      {
        presets: [
          ['@babel/preset-env', { modules: 'commonjs' }],
          '@babel/preset-typescript',
        ],
        plugins: [
          [
            '@babel/plugin-transform-react-jsx',
            { runtime: 'automatic', importSource: 'preact' },
          ],
        ],
      },
    ],
    '^.+\\.m?js$': [
      'babel-jest',
      { presets: [['@babel/preset-env', { modules: 'commonjs' }]] },
    ],
  },
  testEnvironment: 'node',
  extensionsToTreatAsEsm: [],
  transformIgnorePatterns: [
    '/node_modules/(?!(?:preact|@testing-library/preact)/)',
  ],
};
