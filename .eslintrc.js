module.exports = {
    plugins: [
        'jsdoc'
    ],
    extends: [
        'standard',
        'plugin:jsdoc/recommended'
    ],
    rules: {
        indent: ['error', 4],
        semi: ['error', 'always'],
        'jsdoc/check-alignment': 'error',
        'jsdoc/check-param-names': 'error',
        'jsdoc/check-tag-names': 'error',
        'jsdoc/check-types': 'error',
        'jsdoc/implements-on-classes': 'error',
        'jsdoc/no-undefined-types': 'error',
        'jsdoc/require-description': 'error',
        'jsdoc/require-hyphen-before-param-description': 'error',
        'jsdoc/require-param': 'error',
        'jsdoc/require-param-description': 'error',
        'jsdoc/require-param-name': 'error',
        'jsdoc/require-param-type': 'error',
        'jsdoc/require-returns': 'error',
        'jsdoc/require-returns-check': 'error',
        'jsdoc/require-returns-description': 'error',
        'jsdoc/require-returns-type': 'error',
        'jsdoc/no-defaults': 'off'
    }
};
