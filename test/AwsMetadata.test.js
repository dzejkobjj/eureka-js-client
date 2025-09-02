import sinon from 'sinon';
import axios from 'axios';
import AwsMetadata from '../src/AwsMetadata.js';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('AWS Metadata client', () => {
  describe('fetchMetadata()', () => {
    let client;
    beforeEach(() => {
      client = new AwsMetadata({ host: '127.0.0.1:8888' });
    });

    afterEach(() => {
      axios.get.restore();
    });

    it('should call metadata URIs', async () => {
      const axiosStub = sinon.stub(axios, 'get');

      axiosStub.withArgs('http://127.0.0.1:8888/latest/meta-data/ami-id')
        .resolves({ status: 200, data: 'ami-123' });

      axiosStub.withArgs('http://127.0.0.1:8888/latest/meta-data/instance-id')
        .resolves({ status: 200, data: 'i123' });

      axiosStub.withArgs('http://127.0.0.1:8888/latest/meta-data/instance-type')
        .resolves({ status: 200, data: 'medium' });

      axiosStub.withArgs('http://127.0.0.1:8888/latest/meta-data/local-ipv4')
        .resolves({ status: 200, data: '1.1.1.1' });

      axiosStub.withArgs('http://127.0.0.1:8888/latest/meta-data/local-hostname')
        .resolves({ status: 200, data: 'ip-127-0-0-1' });

      axiosStub.withArgs('http://127.0.0.1:8888/latest/meta-data/placement/availability-zone')
        .resolves({ status: 200, data: 'fake-1' });

      axiosStub.withArgs('http://127.0.0.1:8888/latest/meta-data/public-hostname')
        .resolves({ status: 200, data: 'ec2-127-0-0-1' });

      axiosStub.withArgs('http://127.0.0.1:8888/latest/meta-data/public-ipv4')
        .resolves({ status: 200, data: '2.2.2.2' });

      axiosStub.withArgs('http://127.0.0.1:8888/latest/meta-data/mac')
        .resolves({ status: 200, data: 'AB:CD:EF:GH:IJ' });

      axiosStub.withArgs('http://127.0.0.1:8888/latest/dynamic/instance-identity/document')
        .resolves({ status: 200, data: '{"accountId":"123456"}' });

      axiosStub.withArgs('http://127.0.0.1:8888/latest/meta-data/network/interfaces/macs/AB:CD:EF:GH:IJ/vpc-id')
        .resolves({ status: 200, data: 'vpc123' });

      const fetchCb = sinon.spy();
      client.fetchMetadata(fetchCb);

      await sleep(5000)
      expect(axios.get.callCount).toBe(11);

      expect(fetchCb.calledWithMatch({
        accountId: '123456',
        'ami-id': 'ami-123',
        'availability-zone': 'fake-1',
        'instance-id': 'i123',
        'instance-type': 'medium',
        'local-hostname': 'ip-127-0-0-1',
        'local-ipv4': '1.1.1.1',
        mac: 'AB:CD:EF:GH:IJ',
        'public-hostname': 'ec2-127-0-0-1',
        'public-ipv4': '2.2.2.2',
        'vpc-id': 'vpc123',
      })).toBe(true);
    });

    it('should call metadata URIs and filter out null and undefined values', async () => {
      const axiosStub = sinon.stub(axios, 'get');

      axiosStub.withArgs('http://127.0.0.1:8888/latest/meta-data/ami-id')
        .resolves({ status: 200, data: 'ami-123' });

      axiosStub.withArgs('http://127.0.0.1:8888/latest/meta-data/instance-id')
        .resolves({ status: 200, data: 'i123' });

      axiosStub.withArgs('http://127.0.0.1:8888/latest/meta-data/instance-type')
        .resolves({ status: 200, data: 'medium' });

      axiosStub.withArgs('http://127.0.0.1:8888/latest/meta-data/local-ipv4')
        .resolves({ status: 200, data: '1.1.1.1' });

      axiosStub.withArgs('http://127.0.0.1:8888/latest/meta-data/local-hostname')
        .resolves({ status: 200, data: 'ip-127-0-0-1' });

      axiosStub.withArgs('http://127.0.0.1:8888/latest/meta-data/placement/availability-zone')
        .resolves({ status: 200, data: 'fake-1' });

      let undef;
      axiosStub.withArgs('http://127.0.0.1:8888/latest/meta-data/public-hostname')
        .resolves({ status: 200, data: undef });

      axiosStub.withArgs('http://127.0.0.1:8888/latest/meta-data/public-ipv4')
        .resolves({ status: 200, data: null });

      axiosStub.withArgs('http://127.0.0.1:8888/latest/meta-data/mac')
        .resolves({ status: 200, data: 'AB:CD:EF:GH:IJ' });

      axiosStub.withArgs('http://127.0.0.1:8888/latest/dynamic/instance-identity/document')
        .resolves({ status: 200, data: '{"accountId":"123456"}' });

      axiosStub.withArgs('http://127.0.0.1:8888/latest/meta-data/network/interfaces/macs/AB:CD:EF:GH:IJ/vpc-id')
        .resolves({ status: 200, data: 'vpc123' });

      const fetchCb = sinon.spy();
      client.fetchMetadata(fetchCb);

      await sleep(5000)
      expect(axios.get.callCount).toBe(11);
      expect(fetchCb.calledWithMatch({
        accountId: '123456',
        'ami-id': 'ami-123',
        'availability-zone': 'fake-1',
        'instance-id': 'i123',
        'instance-type': 'medium',
        'local-hostname': 'ip-127-0-0-1',
        'local-ipv4': '1.1.1.1',
        mac: 'AB:CD:EF:GH:IJ',
        'vpc-id': 'vpc123',
      })).toBe(true);
      expect(Object.keys(fetchCb.firstCall.args[0])).toEqual(['ami-id',
        'instance-id',
        'instance-type',
        'local-ipv4',
        'local-hostname',
        'availability-zone',
        'mac',
        'accountId',
        'vpc-id']);
    });

    it('should call metadata URIs and filter out errored values', async () => {
      const axiosStub = sinon.stub(axios, 'get');

      axiosStub.withArgs('http://127.0.0.1:8888/latest/meta-data/ami-id')
        .resolves({ status: 200, data: 'ami-123' });

      axiosStub.withArgs('http://127.0.0.1:8888/latest/meta-data/instance-id')
        .resolves({ status: 200, data: 'i123' });

      axiosStub.withArgs('http://127.0.0.1:8888/latest/meta-data/instance-type')
        .resolves({ status: 200, data: 'medium' });

      axiosStub.withArgs('http://127.0.0.1:8888/latest/meta-data/local-ipv4')
        .resolves({ status: 200, data: '1.1.1.1' });

      axiosStub.withArgs('http://127.0.0.1:8888/latest/meta-data/local-hostname')
        .resolves({ status: 200, data: 'ip-127-0-0-1' });

      axiosStub.withArgs('http://127.0.0.1:8888/latest/meta-data/placement/availability-zone')
        .resolves({ status: 200, data: 'fake-1' });

      axiosStub.withArgs('http://127.0.0.1:8888/latest/meta-data/public-hostname')
        .rejects(new Error('fail'));

      axiosStub.withArgs('http://127.0.0.1:8888/latest/meta-data/public-ipv4')
        .rejects(new Error('fail'));

      axiosStub.withArgs('http://127.0.0.1:8888/latest/meta-data/mac')
        .resolves({ status: 200, data: 'AB:CD:EF:GH:IJ' });

      axiosStub.withArgs('http://127.0.0.1:8888/latest/dynamic/instance-identity/document')
        .rejects(new Error('fail'));

      axiosStub.withArgs('http://127.0.0.1:8888/latest/meta-data/network/interfaces/macs/AB:CD:EF:GH:IJ/vpc-id')
        .resolves({ status: 200, data: 'vpc123' });

      const fetchCb = sinon.spy();
      client.fetchMetadata(fetchCb);

      await sleep(5000)
      expect(axios.get.callCount).toBe(11);
      expect(fetchCb.calledWithMatch({
        'ami-id': 'ami-123',
        'availability-zone': 'fake-1',
        'instance-id': 'i123',
        'instance-type': 'medium',
        'local-hostname': 'ip-127-0-0-1',
        'local-ipv4': '1.1.1.1',
        mac: 'AB:CD:EF:GH:IJ',
        'vpc-id': 'vpc123',
      })).toBe(true);
      expect(Object.keys(fetchCb.firstCall.args[0])).toEqual(['ami-id',
        'instance-id',
        'instance-type',
        'local-ipv4',
        'local-hostname',
        'availability-zone',
        'mac',
        'vpc-id']);
    });
  });
});
