import jsdoc from 'eslint-plugin-jsdoc';
import js from '@eslint/js';
import react from 'eslint-plugin-react';
import prettier from 'eslint-plugin-prettier';
import configPrettier from 'eslint-config-prettier';

export default [
    jsdoc.configs['flat/recommended'],
    js.configs.recommended,
    react.configs.flat.recommended,
    configPrettier,
    {
        ignores: ['docs/**'],
        plugins: {
            jsdoc: jsdoc,
            prettier: prettier
        },
        rules: {
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
            'jsdoc/no-defaults': 'off',
            'react/prop-types': 'off'
        },
        settings: {
            react: {
                version: 'detect',
            }
        }
    }
];
