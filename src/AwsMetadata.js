import axios from 'axios';
import async from 'async';
import Logger from './Logger.js';

/*
  Utility class for pulling AWS metadata that Eureka requires when
  registering as an Amazon instance (datacenter).
*/
export default class AwsMetadata {

  constructor(config = {}) {
    this.logger = config.logger || new Logger();
    this.host = config.host || '169.254.169.254';
  }

  fetchMetadata(resultsCallback) {
    async.parallel({
      'ami-id': callback => {
        this.lookupMetadataKey('ami-id', callback);
      },
      'instance-id': callback => {
        this.lookupMetadataKey('instance-id', callback);
      },
      'instance-type': callback => {
        this.lookupMetadataKey('instance-type', callback);
      },
      'local-ipv4': callback => {
        this.lookupMetadataKey('local-ipv4', callback);
      },
      'local-hostname': callback => {
        this.lookupMetadataKey('local-hostname', callback);
      },
      'availability-zone': callback => {
        this.lookupMetadataKey('placement/availability-zone', callback);
      },
      'public-hostname': callback => {
        this.lookupMetadataKey('public-hostname', callback);
      },
      'public-ipv4': callback => {
        this.lookupMetadataKey('public-ipv4', callback);
      },
      mac: callback => {
        this.lookupMetadataKey('mac', callback);
      },
      accountId: callback => {
        // the accountId is in the identity document.
        this.lookupInstanceIdentity((error, identity) => {
          callback(null, identity ? identity.accountId : null);
        });
      },
    }, (error, results) => {
      // we need the mac before we can lookup the vpcId...
      this.lookupMetadataKey(`network/interfaces/macs/${results.mac}/vpc-id`, (err, vpcId) => {
        results['vpc-id'] = vpcId;
        this.logger.debug('Found Instance AWS Metadata', results);
        const filteredResults = Object.keys(results).reduce((filtered, prop) => {
          if (results[prop]) filtered[prop] = results[prop];
          return filtered;
        }, {});
        resultsCallback(filteredResults);
      });
    });
  }

  lookupMetadataKey(key, callback) {
    axios.get(`http://${this.host}/latest/meta-data/${key}`, {
      validateStatus: () => true, // Don't throw for HTTP error status codes
      responseType: 'text'
    })
    .then(response => {
      callback(null, response.status !== 200 ? null : response.data);
    })
    .catch(error => {
      this.logger.error('Error requesting metadata key', error);
      callback(null, null);
    });
  }

  lookupInstanceIdentity(callback) {
    axios.get(`http://${this.host}/latest/dynamic/instance-identity/document`, {
      validateStatus: () => true, // Don't throw for HTTP error status codes
      responseType: 'text'
    })
    .then(response => {
      if (response.status !== 200) {
        callback(null, null);
      } else {
        try {
          callback(null, JSON.parse(response.data));
        } catch (parseError) {
          this.logger.error('Error parsing instance identity document', parseError);
          callback(null, null);
        }
      }
    })
    .catch(error => {
      this.logger.error('Error requesting instance identity document', error);
      callback(null, null);
    });
  }
}
