import {TestBed} from '@angular/core/testing';
import {SettingService} from './setting.service';

describe('SettingService', () => {
  let service: SettingService;
  let store: { [key: string]: string };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SettingService);

    store = {};
    spyOn(localStorage, 'getItem').and.callFake((key) => store[key]);
    spyOn(localStorage, 'setItem').and.callFake((key, value) => (store[key] = value + ''));
    spyOn(localStorage, 'removeItem').and.callFake((key) => delete store[key]);
    SettingService.PREFIX = '';
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getValue', () => {
    it('should return a missing value as null', () => {
      expect(service.getValue('none')).toBeNull();
      expect(localStorage.getItem).toHaveBeenCalledWith('none');
    });

    it('should return an empty value as null', () => {
      store['empty'] = '';
      expect(service.getValue('empty')).toBeNull();
      expect(localStorage.getItem).toHaveBeenCalledWith('empty');
    });

    it('should return an empty JSON string', () => {
      store['empty'] = '""';
      expect(service.getValue('empty')).toEqual('');
      expect(localStorage.getItem).toHaveBeenCalledWith('empty');
    });

    it('should return a string', () => {
      store['string'] = '"test"';
      expect(service.getValue('string')).toEqual('test');
      expect(localStorage.getItem).toHaveBeenCalledWith('string');
    });

    it('should return a number', () => {
      store['number'] = '1';
      expect(service.getValue('number')).toEqual(1);
      expect(localStorage.getItem).toHaveBeenCalledWith('number');
    });

    it('should return boolean true', () => {
      store['boolean'] = 'true';
      expect(service.getValue('boolean')).toEqual(true);
      expect(localStorage.getItem).toHaveBeenCalledWith('boolean');
    });

    it('should return boolean false', () => {
      store['boolean'] = 'false';
      expect(service.getValue('boolean')).toEqual(false);
      expect(localStorage.getItem).toHaveBeenCalledWith('boolean');
    });

    it('should return an empty array', () => {
      store['array'] = '[]';
      expect(service.getValue('array')).toEqual([]);
      expect(localStorage.getItem).toHaveBeenCalledWith('array');
    });

    it('should return an array with values', () => {
      store['array'] = '[1, "a"]';
      expect(service.getValue('array')).toEqual([1, 'a']);
      expect(localStorage.getItem).toHaveBeenCalledWith('array');
    });

    it('should return an empty object', () => {
      store['object'] = '{}';
      expect(service.getValue('object')).toEqual({});
      expect(localStorage.getItem).toHaveBeenCalledWith('object');
    });

    it('should return an object with values', () => {
      store['object'] = '{"a":1,"b":"c"}';
      expect(service.getValue('object')).toEqual({'a': 1, 'b': 'c'});
      expect(localStorage.getItem).toHaveBeenCalledWith('object');
    });

    it('should return an undefined', () => {
      store['undefined'] = 'undefined';
      expect(service.getValue('undefined')).not.toBeDefined();
      expect(localStorage.getItem).toHaveBeenCalledWith('undefined');
    });
  });

  describe('setValue', () => {
    it('should handle undefined value', () => {
      service.setValue('undefined', undefined);
      expect(localStorage.setItem).toHaveBeenCalled();
      expect(store['undefined']).toEqual('undefined');
    });

    it('should handle null value', () => {
      service.setValue('null', null);
      expect(localStorage.setItem).toHaveBeenCalledWith('null', 'null');
      expect(store['null']).toEqual('null');
    });

    it('should handle a string', () => {
      service.setValue('string', 'test');
      expect(localStorage.setItem).toHaveBeenCalledWith('string', '"test"');
      expect(store['string']).toEqual('"test"');
    });

    it('should handle a number', () => {
      service.setValue('number', 1);
      expect(localStorage.setItem).toHaveBeenCalledWith('number', '1');
      expect(store['number']).toEqual('1');
    });

    it('should handle boolean true', () => {
      service.setValue('boolean', true);
      expect(localStorage.setItem).toHaveBeenCalledWith('boolean', 'true');
      expect(store['boolean']).toEqual('true');
    });

    it('should handle boolean false', () => {
      service.setValue('boolean', false);
      expect(localStorage.setItem).toHaveBeenCalledWith('boolean', 'false');
      expect(store['boolean']).toEqual('false');
    });

    it('should save an empty array', () => {
      service.setValue('array', []);
      expect(localStorage.setItem).toHaveBeenCalledWith('array', '[]');
      expect(store['array']).toEqual('[]');
    });

    it('should save an array with values', () => {
      service.setValue('array', [1, 'a']);
      expect(localStorage.setItem).toHaveBeenCalledWith('array', '[1,"a"]');
      expect(store['array']).toEqual('[1,"a"]');
    });

    it('should save an empty object', () => {
      service.setValue('object', {});
      expect(localStorage.setItem).toHaveBeenCalledWith('object', '{}');
      expect(store['object']).toEqual('{}');
    });

    it('should save an object with values', () => {
      service.setValue('object', {'a': 1, 'b': 'c'});
      expect(localStorage.setItem).toHaveBeenCalledWith('object', '{"a":1,"b":"c"}');
      expect(store['object']).toEqual('{"a":1,"b":"c"}');
    });
  });

  describe('injectToken to a missing key', () => {
    it('should ignore undefined', () => {
      expect(service.injectToken('undefined', 'uid', undefined)).toBeTruthy();
      expect(localStorage.setItem).toHaveBeenCalledWith('undefined', '{}');
      expect(store['undefined']).toEqual('{}');
    });

    it('should handle null value', () => {
      expect(service.injectToken('null', 'uid', null)).toBeTruthy();
      expect(localStorage.setItem).toHaveBeenCalledWith('null', '{"uid":null}');
      expect(store['null']).toEqual('{"uid":null}');
    });

    it('should handle a string', () => {
      expect(service.injectToken('string', 'uid', 'test')).toBeTruthy();
      expect(localStorage.setItem).toHaveBeenCalledWith('string', '{"uid":"test"}');
      expect(store['string']).toEqual('{"uid":"test"}');
    });

    it('should handle a number', () => {
      expect(service.injectToken('number', 'uid', 1)).toBeTruthy();
      expect(localStorage.setItem).toHaveBeenCalledWith('number', '{"uid":1}');
      expect(store['number']).toEqual('{"uid":1}');
    });

    it('should handle boolean true', () => {
      expect(service.injectToken('boolean', 'uid', true)).toBeTruthy();
      expect(localStorage.setItem).toHaveBeenCalledWith('boolean', '{"uid":true}');
      expect(store['boolean']).toEqual('{"uid":true}');
    });

    it('should handle boolean false', () => {
      expect(service.injectToken('boolean', 'uid', false)).toBeTruthy();
      expect(localStorage.setItem).toHaveBeenCalledWith('boolean', '{"uid":false}');
      expect(store['boolean']).toEqual('{"uid":false}');
    });

    it('should save an empty array', () => {
      expect(service.injectToken('array', 'uid', [])).toBeTruthy();
      expect(localStorage.setItem).toHaveBeenCalledWith('array', '{"uid":[]}');
      expect(store['array']).toEqual('{"uid":[]}');
    });

    it('should save an array with values', () => {
      expect(service.injectToken('array', 'uid', [1, 'a'])).toBeTruthy();
      expect(localStorage.setItem).toHaveBeenCalledWith('array', '{"uid":[1,"a"]}');
      expect(store['array']).toEqual('{"uid":[1,"a"]}');
    });

    it('should save an empty object', () => {
      expect(service.injectToken('object', 'uid', {})).toBeTruthy();
      expect(localStorage.setItem).toHaveBeenCalledWith('object', '{"uid":{}}');
      expect(store['object']).toEqual('{"uid":{}}');
    });

    it('should save an object with values', () => {
      expect(service.injectToken('object', 'uid', {'a': 1, 'b': 'c'})).toBeTruthy();
      expect(localStorage.setItem).toHaveBeenCalledWith('object',
        '{"uid":{"a":1,"b":"c"}}');
      expect(store['object']).toEqual('{"uid":{"a":1,"b":"c"}}');
    });
  });

  describe('injectToken to an existing array', () => {
    it('should ignore undefined', () => {
      store['undefined'] = '{"a":null}';
      expect(service.injectToken('undefined', 'uid', undefined)).toBeTruthy();
      expect(localStorage.setItem).toHaveBeenCalledWith('undefined', '{"a":null}');
      expect(store['undefined']).toEqual('{"a":null}');
    });

    it('should handle null value', () => {
      store['null'] = '{"a":null}';
      expect(service.injectToken('null', 'uid', null)).toBeTruthy();
      expect(localStorage.setItem).toHaveBeenCalledWith('null',
        '{"a":null,"uid":null}');
      expect(store['null']).toEqual('{"a":null,"uid":null}');
    });

    it('should handle a string', () => {
      store['string'] = '{"a":"test1"}';
      expect(service.injectToken('string', 'uid', 'test2')).toBeTruthy();
      expect(localStorage.setItem).toHaveBeenCalledWith('string',
        '{"a":"test1","uid":"test2"}');
      expect(store['string']).toEqual('{"a":"test1","uid":"test2"}');
    });

    it('should handle a number', () => {
      store['number'] = '{"a":1}';
      expect(service.injectToken('number', 'uid', 2)).toBeTruthy();
      expect(localStorage.setItem).toHaveBeenCalledWith('number', '{"a":1,"uid":2}');
      expect(store['number']).toEqual('{"a":1,"uid":2}');
    });

    it('should handle boolean true', () => {
      store['boolean'] = '{"a":false}';
      expect(service.injectToken('boolean', 'uid', true)).toBeTruthy();
      expect(localStorage.setItem).toHaveBeenCalledWith('boolean',
        '{"a":false,"uid":true}');
      expect(store['boolean']).toEqual('{"a":false,"uid":true}');
    });

    it('should handle boolean false', () => {
      store['boolean'] = '{"a":true}';
      expect(service.injectToken('boolean', 'uid', false)).toBeTruthy();
      expect(localStorage.setItem).toHaveBeenCalledWith('boolean',
        '{"a":true,"uid":false}');
      expect(store['boolean']).toEqual('{"a":true,"uid":false}');
    });

    it('should save an empty array', () => {
      store['array'] = '{"a":[]}';
      expect(service.injectToken('array', 'uid', [])).toBeTruthy();
      expect(localStorage.setItem).toHaveBeenCalledWith('array',
        '{"a":[],"uid":[]}');
      expect(store['array']).toEqual('{"a":[],"uid":[]}');
    });

    it('should save an array with values', () => {
      store['array'] = '{"a":[2,"b"]}';
      expect(service.injectToken('array', 'uid', [1, 'a'])).toBeTruthy();
      expect(localStorage.setItem).toHaveBeenCalledWith('array',
        '{"a":[2,"b"],"uid":[1,"a"]}');
      expect(store['array']).toEqual('{"a":[2,"b"],"uid":[1,"a"]}');
    });

    it('should save an empty object', () => {
      store['object'] = '{"a":{}}';
      expect(service.injectToken('object', 'uid', {})).toBeTruthy();
      expect(localStorage.setItem).toHaveBeenCalledWith('object',
        '{"a":{},"uid":{}}');
      expect(store['object']).toEqual('{"a":{},"uid":{}}');
    });

    it('should save an object with values', () => {
      store['object'] = '{"a":{"d":2}}';
      expect(service.injectToken('object', 'uid', {'a': 1, 'b': 'c'})).toBeTruthy();
      expect(localStorage.setItem).toHaveBeenCalledWith('object',
        '{"a":{"d":2},"uid":{"a":1,"b":"c"}}');
      expect(store['object']).toEqual('{"a":{"d":2},"uid":{"a":1,"b":"c"}}');
    });
  });

  describe('injectToken to a wrong type', () => {
    it('should fail', () => {
      store['string'] = '"test1"';
      expect(service.injectToken('string', 'uid', 'test2')).toBeFalsy();
      expect(localStorage.setItem).not.toHaveBeenCalled();
      expect(store['string']).toEqual('"test1"');
    });
  });

  describe('removeKey', () => {
    it('should handle deletion of a missing key', () => {
      expect(service.removeKey('none')).toBeTruthy();
      expect(localStorage.removeItem).toHaveBeenCalledWith('none');
    });

    it('should remove an existing key', () => {
      store['string'] = 'test';
      expect(service.removeKey('string')).toBeTruthy();
      expect(localStorage.removeItem).toHaveBeenCalledWith('string');
      expect(store['string']).not.toBeDefined();
    });
  });

  describe('replaceToken', () => {
    it('should fail on a missing key', () => {
      expect(service.replaceToken('none', 'uid', 'test')).toEqual('test');
      expect(localStorage.setItem).not.toHaveBeenCalled();
      expect(store['none']).not.toBeDefined();
    });

    it('should fail on a wrong type', () => {
      store['string'] = '"test1"';
      expect(service.replaceToken('string', 'uid', 'test2')).toEqual('test2');
      expect(localStorage.setItem).not.toHaveBeenCalled();
      expect(store['string']).toEqual('"test1"');
    });

    it('should fail on a missing token', () => {
      store['object'] = '{"a":{}}';
      expect(service.replaceToken('object', 'uid', 'test')).toEqual('test');
      expect(localStorage.setItem).not.toHaveBeenCalled();
      expect(store['object']).toEqual('{"a":{}}');
    });

    it('should rename the token', () => {
      store['object'] = '{"old":{"a":1}}';
      expect(service.replaceToken('object', 'old', 'new')).toEqual('new');
      expect(localStorage.setItem).toHaveBeenCalledWith('object',
        '{"new":{"a":1}}');
      expect(store['object']).toEqual('{"new":{"a":1}}');
    });
  });

  describe('removeToken', () => {
    it('should fail on a missing key', () => {
      service.removeToken('none', 'uid');
      expect(localStorage.setItem).not.toHaveBeenCalled();
      expect(store['none']).not.toBeDefined();
    });

    it('should fail on a wrong type', () => {
      store['string'] = '"test1"';
      service.removeToken('string', 'uid');
      expect(localStorage.setItem).not.toHaveBeenCalled();
      expect(store['string']).toEqual('"test1"');
    });

    it('should fail on a missing token', () => {
      store['object'] = '{"a":{}}';
      service.removeToken('object', 'uid');
      expect(localStorage.setItem).not.toHaveBeenCalled();
      expect(store['object']).toEqual('{"a":{}}');
    });

    it('should rename the token', () => {
      store['object'] = '{"old":{"a":1},"test":2}';
      service.removeToken('object', 'old');
      expect(localStorage.setItem).toHaveBeenCalledWith('object',
        '{"test":2}');
      expect(store['object']).toEqual('{"test":2}');
    });
  });
});
