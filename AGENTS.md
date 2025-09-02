# Agent Guidelines for eureka-js-client

## Build/Test Commands
- `npm test` or `gulp test` - Run lint and unit tests with vitest
- `npm run integration` or `gulp test:integration` - Run integration tests (timeout: 120s)
- `npm run test:vitest` or `vitest run` - Run unit tests with vitest directly
- `npm run test:watch` or `vitest` - Run unit tests in watch mode
- `gulp vitest` - Run unit tests only (excludes integration tests)
- `gulp lint` - Run ESLint on src and test files
- `gulp build` - Copy src files to lib directory

## Single Test Commands
- Run specific test file: `npx vitest run test/FileName.test.js`
- Run integration test only: `gulp test:integration`
- Run all tests in watch mode: `npm run test:watch`

## Code Style Guidelines
- **Type**: ES6 modules with `"type": "module"` in package.json
- **Imports**: Use ES6 import syntax with `.js` extensions (required by ESLint)
- **Classes**: Use ES6 class syntax extending EventEmitter where appropriate
- **Functions**: Standalone utility functions before class definitions
- **Error Handling**: Use try/catch blocks, throw descriptive Error objects
- **Naming**: camelCase for variables/functions, PascalCase for classes
- **Comments**: Use block comments `/* */` for module/class descriptions
- **Formatting**: Follow eslint:recommended rules with import plugin
- **Dependencies**: lodash functions imported individually (e.g., `import merge from 'lodash/merge.js'`)
- **Config**: YAML configuration files supported via js-yaml
- **Testing**: Use vitest assertions (expect().toBe(), expect().toEqual(), etc.) instead of chai