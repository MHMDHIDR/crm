module.exports = {
  extends: ['next/core-web-vitals', 'prettier'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        name: 'next/link',
        importNames: ['Link', 'redirect', 'usePathname', 'useRouter'],
        message: 'Please import from `@/i18n/routing` instead.'
      },
      {
        name: 'next/navigation',
        importNames: ['redirect', 'permanentRedirect', 'useRouter', 'usePathname'],
        message: 'Please import from `@/i18n/routing` instead.'
      }
    ],
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-unused-vars': 'off',
    'arrow-body-style': ['warn', 'as-needed'],
    'func-names': ['warn', 'as-needed'],
    'max-depth': ['warn', 4],
    'max-lines': ['warn', { max: 450, skipBlankLines: true, skipComments: true }],
    'prefer-arrow-callback': 'warn',
    'prefer-const': 'warn',
    'prefer-template': 'warn',
    'object-curly-spacing': ['warn', 'always'],
    'keyword-spacing': 'warn',
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/no-unescaped-entities': 'warn',
    'react/no-children-prop': 'warn',
    'react/jsx-fragments': ['warn', 'syntax'],
    'react/jsx-no-useless-fragment': 'warn',
    'react/jsx-pascal-case': 'warn',
    'import/prefer-default-export': 'off',
    '@next/next/no-img-element': 'warn',
    '@next/next/no-html-link-for-pages': 'warn'
  }
}
