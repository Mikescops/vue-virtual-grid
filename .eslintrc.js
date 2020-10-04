module.exports = {
    root: true,
    env: {
        browser: true,
        node: true,
        es6: true
    },
    parser: 'vue-eslint-parser',
    parserOptions: {
        parser: '@typescript-eslint/parser',
        ecmaVersion: 2020,
        sourceType: 'module'
    },
    plugins: ['vue', '@typescript-eslint'],
    rules: {
        'brace-style': 'error',
        'block-scoped-var': 'error',
        'camelcase': 'off',
        'comma-style': ['error', 'last'],
        'comma-dangle': 'off',
        'curly': ['error', 'all'],
        'dot-notation': 'error',
        'eqeqeq': ['error', 'allow-null'],
        'eol-last': 'error',
        'guard-for-in': 'error',
        'indent': ['error', 4],
        'keyword-spacing': 'error',
        'max-len': ['error', 120],
        'new-cap': 'off',
        'no-bitwise': 'error',
        'no-caller': 'error',
        'no-cond-assign': ['error', 'except-parens'],
        'no-debugger': 'error',
        'no-empty': 'error',
        'no-eval': 'error',
        'no-extend-native': 'error',
        'no-irregular-whitespace': 'error',
        'no-iterator': 'error',
        'no-loop-func': 'error',
        'no-lonely-if': 'error',
        'no-mixed-spaces-and-tabs': 'error',
        'no-multiple-empty-lines': 'error',
        'no-multi-str': 'error',
        'no-new': 'error',
        'no-plusplus': [
            'error',
            {
                'allowForLoopAfterthoughts': true
            }
        ],
        'no-proto': 'error',
        'no-sequences': 'error',
        'no-undef': 'error',
        'no-unused-vars': 'error',
        'no-with': 'error',
        'no-trailing-spaces': 'error',
        'one-var': ['error', 'never'],
        'quotes': ['error', 'single'],
        'semi': ['error', 'always'],
        'space-in-parens': ['error', 'never'],
        'space-before-blocks': 'error',
        'space-before-function-paren': [
            'error',
            {
                'anonymous': 'always',
                'named': 'never'
            }
        ],
        'space-unary-ops': 'error',
        'spaced-comment': 'error',
        'valid-typeof': 'error',
        'wrap-iife': ['error', 'inside'],
        '@typescript-eslint/camelcase': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-inferrable-types': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off'
    },
    extends: ['plugin:vue/essential', 'plugin:@typescript-eslint/recommended'],
    overrides: [
        {
            files: ['*.vue'],
            rules: {
                '@typescript-eslint/no-unused-vars': [2, { 'args': 'none' }]
            }
        }
    ]
};
