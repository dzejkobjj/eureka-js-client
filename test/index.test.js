import { expect } from 'chai'

import EurekaClient from '../src/EurekaClient.js';
import EurekaDefault, { Eureka as EurekaNamed } from '../src/index.js';

// Compatibility with older node versions:
// const EurekaCommonjs = require('../src/index').Eureka; // Not supported in ES modules

describe('index', () => {
  it('should export both a default and a named', () => {
    expect(EurekaDefault).to.equal(EurekaClient);
    expect(EurekaDefault).to.equal(EurekaNamed);
  });

  // Note: CommonJS compatibility test removed when migrating to ES modules
});
