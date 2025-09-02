import Eureka from '../src/index.js';

describe('Integration Test', () => {
  const config = {
    instance: {
      app: 'jqservice',
      hostName: 'localhost',
      ipAddr: '127.0.0.1',
      port: {
        $: 8080,
        '@enabled': true
      },
      vipAddress: 'jq.test.something.com',
      dataCenterInfo: {
        '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
        name: 'MyOwn',
      },
    },
    eureka: {
      heartbeatInterval: 30000,
      registryFetchInterval: 5000,
      fetchRegistry: true,
      waitForRegistry: true,
      servicePath: '/eureka/v2/apps/',
      ssl: false,
      useDns: false,
      fetchMetadata: true,
      host: 'localhost',
      port: 8761,
    },
  };

  const client = new Eureka(config);
  before(async () => {
    await promisify(client.start.bind(client))();
  });

  it('should be able to get instance by the app id', () => {
    const instances = client.getInstancesByAppId(config.instance.app);
    expect(instances.length).toBe(1);
  });

  it('should be able to get instance by the vipAddress', () => {
    const instances = client.getInstancesByVipAddress(config.instance.vipAddress);
    expect(instances.length).toBe(1);
  });

  after(async () => {
    await promisify(client.stop.bind(client))();
  });
});
