import { describe, it, expect } from 'vitest';
import { arrayOrObj, findInstance, normalizeDelta } from '../src/deltaUtils.js';

describe('deltaUtils', () => {
  describe('arrayOrObj', () => {
    it('should return same array if passed an array', () => {
      const arr = ['foo'];
      expect(arrayOrObj(arr)).toBe(arr);
    });

    it('should wrap object in array if passed an object', () => {
      const obj = { foo: 'bar' };
      expect(arrayOrObj(obj)[0]).toBe(obj);
    });
    it('should return an array containing obj', () => {
      const obj = {};
      expect(arrayOrObj(obj)[0]).toBe(obj);
    });
  });
  describe('findInstance', () => {
    it('should return true if objects match', () => {
      const obj1 = { hostName: 'foo', port: { $: '6969' } };
      const obj2 = { hostName: 'foo', port: { $: '6969' } };
      expect(findInstance(obj1)(obj2)).toBe(true);
    });
    it('should return false if objects do not match', () => {
      const obj1 = { hostName: 'foo', port: { $: '6969' } };
      const obj2 = { hostName: 'bar', port: { $: '1111' } };
      expect(findInstance(obj1)(obj2)).toBe(false);
    });
  });
  describe('normalizeDelta', () => {
    it('should normalize nested objs to arrays', () => {
      const delta = {
        instance: {
          hostName: 'foo', port: { $: '6969' },
        },
      };
      const normalized = normalizeDelta(delta);
      expect(Array.isArray(normalized)).toBe(true);
      expect(Array.isArray(normalized[0].instance)).toBe(true);
    });
  });
});
