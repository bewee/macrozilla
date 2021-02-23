module.exports = {
  'env': {
    'browser': true,
    'commonjs': true,
    'es6': true,
    'jasmine': true,
    'jest': true,
    'mocha': true,
    'node': true
  },
  'extends': 'eslint:recommended',
  'parser': 'babel-eslint',
  'parserOptions': {
    'sourceType': 'module'
  },
  'rules': {
    'arrow-parens': [
      'error',
      'always'
    ],
    'arrow-spacing': 'error',
    'block-scoped-var': 'error',
    'block-spacing': [
      'error',
      'always'
    ],
    'brace-style': [
      'error',
      '1tbs'
    ],
    'comma-dangle': [
      'error',
      'always-multiline'
    ],
    'comma-spacing': 'error',
    'comma-style': [
      'error',
      'last'
    ],
    'computed-property-spacing': [
      'error',
      'never'
    ],
    'curly': 'warn',
    'dot-notation': 'error',
    'eol-last': 'error',
    'func-call-spacing': [
      'error',
      'never'
    ],
    'implicit-arrow-linebreak': [
      'error',
      'beside'
    ],
    'indent': [
      'error',
      2,
      {
        'ArrayExpression': 'first',
        'CallExpression': {
          'arguments': 'first'
        },
        'FunctionDeclaration': {
          'parameters': 'first'
        },
        'FunctionExpression': {
          'parameters': 'first'
        },
        'ObjectExpression': 'first',
        'SwitchCase': 1
      }
    ],
    'key-spacing': [
      'error',
      {
        'afterColon': true,
        'beforeColon': false,
        'mode': 'strict'
      }
    ],
    'keyword-spacing': [
      'error',
      {
        'after': true,
        'before': true
      }
    ],
    'linebreak-style': [
      'error',
      'unix'
    ],
    'lines-between-class-members': [
      'error',
      'always'
    ],
    'max-len': [
      'warn',
      80
    ],
    'multiline-ternary': [
      'error',
      'always-multiline'
    ],
    'no-ex-assign': 'warn',
    'no-fallthrough': 'warn',
    'no-console': 0,
    'no-duplicate-imports': 'error',
    'no-eval': 'warn',
    'no-floating-decimal': 'error',
    'no-implicit-globals': 'error',
    'no-implied-eval': 'error',
    'no-lonely-if': 'warn',
    'no-async-promise-executor': 'warn',
    'no-multi-spaces': [
      'warn',
      {
        'ignoreEOLComments': true
      }
    ],
    'no-multiple-empty-lines': 'error',
    'no-prototype-builtins': 'off',
    'no-return-assign': 'error',
    'no-script-url': 'error',
    'no-self-compare': 'error',
    'no-sequences': 'error',
    'no-shadow-restricted-names': 'error',
    'no-tabs': 'error',
    'no-trailing-spaces': 'error',
    'no-undefined': 'error',
    'no-unmodified-loop-condition': 'error',
    'no-constant-condition': ["error", { "checkLoops": false }],
    'no-unused-vars': [
      'error',
      {
        'argsIgnorePattern': '^_',
        'varsIgnorePattern': '^_'
      }
    ],
    'no-useless-computed-key': 'error',
    'no-useless-concat': 'error',
    'no-useless-constructor': 'error',
    'no-useless-return': 'error',
    'no-var': 'error',
    'no-void': 'error',
    'no-whitespace-before-property': 'error',
    'object-curly-newline': [
      'error',
      {
        'consistent': true
      }
    ],
    'object-curly-spacing': [
      'error',
      'never'
    ],
    'object-property-newline': [
      'error',
      {
        'allowMultiplePropertiesPerLine': true
      }
    ],
    'operator-linebreak': [
      'error',
      'after'
    ],
    'padded-blocks': [
      'error',
      {
        'blocks': 'never'
      }
    ],
    'prefer-const': 'error',
    'prefer-template': 'error',
    'quote-props': [
      'error',
      'as-needed'
    ],
    'quotes': [
      'error',
      'single',
      {
        'allowTemplateLiterals': true
      }
    ],
    'semi': [
      'error',
      'always'
    ],
    'semi-spacing': [
      'error',
      {
        'after': true,
        'before': false
      }
    ],
    'semi-style': [
      'error',
      'last'
    ],
    'space-before-blocks': [
      'error',
      'always'
    ],
    'space-before-function-paren': [
      'error',
      {
        'anonymous': 'never',
        'asyncArrow': 'always',
        'named': 'never'
      }
    ],
    'space-in-parens': [
      'error',
      'never'
    ],
    'space-infix-ops': 'warn',
    'space-unary-ops': [
      'error',
      {
        'nonwords': false,
        'words': true
      }
    ],
    'spaced-comment': [
      'warn',
      'always',
      {
        'block': {
          'balanced': true,
          'exceptions': [
            '*'
          ]
        }
      }
    ],
    'switch-colon-spacing': [
      'error',
      {
        'after': true,
        'before': false
      }
    ],
    'template-curly-spacing': [
      'error',
      'never'
    ],
    'yoda': 'error'
  }
};
