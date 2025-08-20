import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'request';
import AwsMetadata from '../src/AwsMetadata.js';

describe('AWS Metadata client', () => {
  describe('fetchMetadata()', () => {
    let client;
    beforeEach(() => {
      client = new AwsMetadata({ host: '127.0.0.1:8888' });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should call metadata URIs', () => {
      const requestStub = vi.spyOn(request, 'get');
      
      // Mock different URLs with different responses
      requestStub.mockImplementation((opts, callback) => {
        const { url } = opts;
        
        const responses = {
          'http://127.0.0.1:8888/latest/meta-data/ami-id': 'ami-123',
          'http://127.0.0.1:8888/latest/meta-data/instance-id': 'i123',
          'http://127.0.0.1:8888/latest/meta-data/instance-type': 'medium',
          'http://127.0.0.1:8888/latest/meta-data/local-ipv4': '1.1.1.1',
          'http://127.0.0.1:8888/latest/meta-data/local-hostname': 'ip-127-0-0-1',
          'http://127.0.0.1:8888/latest/meta-data/placement/availability-zone': 'fake-1',
          'http://127.0.0.1:8888/latest/meta-data/public-hostname': 'ec2-127-0-0-1',
          'http://127.0.0.1:8888/latest/meta-data/public-ipv4': '2.2.2.2',
          'http://127.0.0.1:8888/latest/meta-data/mac': 'AB:CD:EF:GH:IJ',
          'http://127.0.0.1:8888/latest/dynamic/instance-identity/document': '{"accountId":"123456"}',
          'http://127.0.0.1:8888/latest/meta-data/network/interfaces/macs/AB:CD:EF:GH:IJ/vpc-id': 'vpc123'
        };
        
        const responseBody = responses[url] || null;
        callback(null, { statusCode: 200 }, responseBody);
      });

      const fetchCb = vi.fn();
      client.fetchMetadata(fetchCb);

      expect(requestStub).toHaveBeenCalledTimes(11);

      expect(fetchCb).toHaveBeenCalledWith({
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
      });
    });

    it('should call metadata URIs and filter out null and undefined values', () => {
      const requestStub = vi.spyOn(request, 'get');
      
      // Mock different URLs with different responses, some with null/undefined
      requestStub.mockImplementation((opts, callback) => {
        const { url } = opts;
        
        const responses = {
          'http://127.0.0.1:8888/latest/meta-data/ami-id': 'ami-123',
          'http://127.0.0.1:8888/latest/meta-data/instance-id': 'i123',
          'http://127.0.0.1:8888/latest/meta-data/instance-type': 'medium',
          'http://127.0.0.1:8888/latest/meta-data/local-ipv4': '1.1.1.1',
          'http://127.0.0.1:8888/latest/meta-data/local-hostname': 'ip-127-0-0-1',
          'http://127.0.0.1:8888/latest/meta-data/placement/availability-zone': 'fake-1',
          'http://127.0.0.1:8888/latest/meta-data/public-hostname': undefined,
          'http://127.0.0.1:8888/latest/meta-data/public-ipv4': null,
          'http://127.0.0.1:8888/latest/meta-data/mac': 'AB:CD:EF:GH:IJ',
          'http://127.0.0.1:8888/latest/dynamic/instance-identity/document': '{"accountId":"123456"}',
          'http://127.0.0.1:8888/latest/meta-data/network/interfaces/macs/AB:CD:EF:GH:IJ/vpc-id': 'vpc123'
        };
        
        const responseBody = responses[url];
        callback(null, { statusCode: 200 }, responseBody);
      });

      const fetchCb = vi.fn();
      client.fetchMetadata(fetchCb);

      expect(requestStub).toHaveBeenCalledTimes(11);
      expect(fetchCb).toHaveBeenCalledWith({
        accountId: '123456',
        'ami-id': 'ami-123',
        'availability-zone': 'fake-1',
        'instance-id': 'i123',
        'instance-type': 'medium',
        'local-hostname': 'ip-127-0-0-1',
        'local-ipv4': '1.1.1.1',
        mac: 'AB:CD:EF:GH:IJ',
        'vpc-id': 'vpc123',
      });
      
      const resultKeys = Object.keys(fetchCb.mock.calls[0][0]);
      expect(resultKeys).toEqual(expect.arrayContaining(['ami-id',
        'instance-id',
        'instance-type',
        'local-ipv4',
        'local-hostname',
        'availability-zone',
        'mac',
        'accountId',
        'vpc-id']));
    });

    it('should call metadata URIs and filter out errored values', () => {
      const requestStub = vi.spyOn(request, 'get');
      
      // Mock different URLs with different responses, some with errors
      requestStub.mockImplementation((opts, callback) => {
        const { url } = opts;
        
        const responses = {
          'http://127.0.0.1:8888/latest/meta-data/ami-id': 'ami-123',
          'http://127.0.0.1:8888/latest/meta-data/instance-id': 'i123',
          'http://127.0.0.1:8888/latest/meta-data/instance-type': 'medium',
          'http://127.0.0.1:8888/latest/meta-data/local-ipv4': '1.1.1.1',
          'http://127.0.0.1:8888/latest/meta-data/local-hostname': 'ip-127-0-0-1',
          'http://127.0.0.1:8888/latest/meta-data/placement/availability-zone': 'fake-1',
          'http://127.0.0.1:8888/latest/meta-data/mac': 'AB:CD:EF:GH:IJ',
          'http://127.0.0.1:8888/latest/meta-data/network/interfaces/macs/AB:CD:EF:GH:IJ/vpc-id': 'vpc123'
        };
        
        const errorUrls = [
          'http://127.0.0.1:8888/latest/meta-data/public-hostname',
          'http://127.0.0.1:8888/latest/meta-data/public-ipv4',
          'http://127.0.0.1:8888/latest/dynamic/instance-identity/document'
        ];
        
        if (errorUrls.includes(url)) {
          callback(new Error('fail'));
        } else {
          const responseBody = responses[url] || null;
          callback(null, { statusCode: 200 }, responseBody);
        }
      });

      const fetchCb = vi.fn();
      client.fetchMetadata(fetchCb);

      expect(requestStub).toHaveBeenCalledTimes(11);
      expect(fetchCb).toHaveBeenCalledWith({
        'ami-id': 'ami-123',
        'availability-zone': 'fake-1',
        'instance-id': 'i123',
        'instance-type': 'medium',
        'local-hostname': 'ip-127-0-0-1',
        'local-ipv4': '1.1.1.1',
        mac: 'AB:CD:EF:GH:IJ',
        'vpc-id': 'vpc123',
      });
      
      const resultKeys = Object.keys(fetchCb.mock.calls[0][0]);
      expect(resultKeys).toEqual(expect.arrayContaining(['ami-id',
        'instance-id',
        'instance-type',
        'local-ipv4',
        'local-hostname',
        'availability-zone',
        'mac',
        'vpc-id']));
    });
  });
});
