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
    SettingService.prefix = '';
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
      store.empty = '';
      expect(service.getValue('empty')).toBeNull();
      expect(localStorage.getItem).toHaveBeenCalledWith('empty');
    });

    it('should return an empty JSON string', () => {
      store.emptyKey = '""';
      expect(service.getValue('emptyKey')).toEqual('');
      expect(localStorage.getItem).toHaveBeenCalledWith('emptyKey');
    });

    it('should return a string', () => {
      store.stringKey = '"test"';
      expect(service.getValue('stringKey')).toEqual('test');
      expect(localStorage.getItem).toHaveBeenCalledWith('stringKey');
    });

    it('should return a number', () => {
      store.numberKey = '1';
      expect(service.getValue('numberKey')).toEqual(1);
      expect(localStorage.getItem).toHaveBeenCalledWith('numberKey');
    });

    it('should return boolean true', () => {
      store.booleanKey = 'true';
      expect(service.getValue('booleanKey')).toEqual(true);
      expect(localStorage.getItem).toHaveBeenCalledWith('booleanKey');
    });

    it('should return boolean false', () => {
      store.booleanKey = 'false';
      expect(service.getValue('booleanKey')).toEqual(false);
      expect(localStorage.getItem).toHaveBeenCalledWith('booleanKey');
    });

    it('should return an empty array', () => {
      store.arrayKey = '[]';
      expect(service.getValue('arrayKey')).toEqual([]);
      expect(localStorage.getItem).toHaveBeenCalledWith('arrayKey');
    });

    it('should return an array with values', () => {
      store.arrayKey = '[1, "a"]';
      expect(service.getValue('arrayKey')).toEqual([1, 'a']);
      expect(localStorage.getItem).toHaveBeenCalledWith('arrayKey');
    });

    it('should return an empty object', () => {
      store.objectKey = '{}';
      expect(service.getValue('objectKey')).toEqual({});
      expect(localStorage.getItem).toHaveBeenCalledWith('objectKey');
    });

    it('should return an object with values', () => {
      store.objectKey = '{"a":1,"b":"c"}';
      expect(service.getValue('objectKey')).toEqual({a: 1, b: 'c'});
      expect(localStorage.getItem).toHaveBeenCalledWith('objectKey');
    });

    it('should return an undefined', () => {
      store.undefinedKey = 'undefined';
      expect(service.getValue('undefinedKey')).not.toBeDefined();
      expect(localStorage.getItem).toHaveBeenCalledWith('undefinedKey');
    });
  });

  describe('setValue', () => {
    it('should handle undefined value', () => {
      service.setValue('undefined', undefined);
      expect(localStorage.setItem).toHaveBeenCalled();
      expect(store.undefined).toEqual('undefined');
    });

    it('should handle null value', () => {
      service.setValue('null', null);
      expect(localStorage.setItem).toHaveBeenCalledWith('null', 'null');
      expect(store.null).toEqual('null');
    });

    it('should handle a string', () => {
      service.setValue('string', 'test');
      expect(localStorage.setItem).toHaveBeenCalledWith('string', '"test"');
      expect(store.string).toEqual('"test"');
    });

    it('should handle a number', () => {
      service.setValue('number', 1);
      expect(localStorage.setItem).toHaveBeenCalledWith('number', '1');
      expect(store.number).toEqual('1');
    });

    it('should handle boolean true', () => {
      service.setValue('boolean', true);
      expect(localStorage.setItem).toHaveBeenCalledWith('boolean', 'true');
      expect(store.boolean).toEqual('true');
    });

    it('should handle boolean false', () => {
      service.setValue('boolean', false);
      expect(localStorage.setItem).toHaveBeenCalledWith('boolean', 'false');
      expect(store.boolean).toEqual('false');
    });

    it('should save an empty array', () => {
      service.setValue('array', []);
      expect(localStorage.setItem).toHaveBeenCalledWith('array', '[]');
      expect(store.array).toEqual('[]');
    });

    it('should save an array with values', () => {
      service.setValue('array', [1, 'a']);
      expect(localStorage.setItem).toHaveBeenCalledWith('array', '[1,"a"]');
      expect(store.array).toEqual('[1,"a"]');
    });

    it('should save an empty object', () => {
      service.setValue('object', {});
      expect(localStorage.setItem).toHaveBeenCalledWith('object', '{}');
      expect(store.object).toEqual('{}');
    });

    it('should save an object with values', () => {
      service.setValue('object', {a: 1, b: 'c'});
      expect(localStorage.setItem).toHaveBeenCalledWith('object', '{"a":1,"b":"c"}');
      expect(store.object).toEqual('{"a":1,"b":"c"}');
    });
  });

  describe('injectToken to a missing key', () => {
    it('should ignore undefined', () => {
      expect(service.injectToken('undefined', 'uid', undefined)).toBeTruthy();
      expect(localStorage.setItem).toHaveBeenCalledWith('undefined', '{}');
      expect(store.undefined).toEqual('{}');
    });

    it('should handle null value', () => {
      expect(service.injectToken('null', 'uid', null)).toBeTruthy();
      expect(localStorage.setItem).toHaveBeenCalledWith('null', '{"uid":null}');
      expect(store.null).toEqual('{"uid":null}');
    });

    it('should handle a string', () => {
      expect(service.injectToken('string', 'uid', 'test')).toBeTruthy();
      expect(localStorage.setItem).toHaveBeenCalledWith('string', '{"uid":"test"}');
      expect(store.string).toEqual('{"uid":"test"}');
    });

    it('should handle a number', () => {
      expect(service.injectToken('number', 'uid', 1)).toBeTruthy();
      expect(localStorage.setItem).toHaveBeenCalledWith('number', '{"uid":1}');
      expect(store.number).toEqual('{"uid":1}');
    });

    it('should handle boolean true', () => {
      expect(service.injectToken('boolean', 'uid', true)).toBeTruthy();
      expect(localStorage.setItem).toHaveBeenCalledWith('boolean', '{"uid":true}');
      expect(store.boolean).toEqual('{"uid":true}');
    });

    it('should handle boolean false', () => {
      expect(service.injectToken('boolean', 'uid', false)).toBeTruthy();
      expect(localStorage.setItem).toHaveBeenCalledWith('boolean', '{"uid":false}');
      expect(store.boolean).toEqual('{"uid":false}');
    });

    it('should save an empty array', () => {
      expect(service.injectToken('array', 'uid', [])).toBeTruthy();
      expect(localStorage.setItem).toHaveBeenCalledWith('array', '{"uid":[]}');
      expect(store.array).toEqual('{"uid":[]}');
    });

    it('should save an array with values', () => {
      expect(service.injectToken('array', 'uid', [1, 'a'])).toBeTruthy();
      expect(localStorage.setItem).toHaveBeenCalledWith('array', '{"uid":[1,"a"]}');
      expect(store.array).toEqual('{"uid":[1,"a"]}');
    });

    it('should save an empty object', () => {
      expect(service.injectToken('object', 'uid', {})).toBeTruthy();
      expect(localStorage.setItem).toHaveBeenCalledWith('object', '{"uid":{}}');
      expect(store.object).toEqual('{"uid":{}}');
    });

    it('should save an object with values', () => {
      expect(service.injectToken('object', 'uid', {a: 1, b: 'c'})).toBeTruthy();
      expect(localStorage.setItem).toHaveBeenCalledWith('object',
        '{"uid":{"a":1,"b":"c"}}');
      expect(store.object).toEqual('{"uid":{"a":1,"b":"c"}}');
    });
  });

  describe('injectToken to an existing array', () => {
    it('should ignore undefined', () => {
      store.undefinedKey = '{"a":null}';
      expect(service.injectToken('undefinedKey', 'uid', undefined)).toBeTruthy();
      expect(localStorage.setItem).toHaveBeenCalledWith('undefinedKey', '{"a":null}');
      expect(store.undefinedKey).toEqual('{"a":null}');
    });

    it('should handle null value', () => {
      store.nullKey = '{"a":null}';
      expect(service.injectToken('nullKey', 'uid', null)).toBeTruthy();
      expect(localStorage.setItem).toHaveBeenCalledWith('nullKey',
        '{"a":null,"uid":null}');
      expect(store.nullKey).toEqual('{"a":null,"uid":null}');
    });

    it('should handle a string', () => {
      store.stringKey = '{"a":"test1"}';
      expect(service.injectToken('stringKey', 'uid', 'test2')).toBeTruthy();
      expect(localStorage.setItem).toHaveBeenCalledWith('stringKey',
        '{"a":"test1","uid":"test2"}');
      expect(store.stringKey).toEqual('{"a":"test1","uid":"test2"}');
    });

    it('should handle a number', () => {
      store.numberKey = '{"a":1 }';
      expect(service.injectToken('numberKey', 'uid', 2)).toBeTruthy();
      expect(localStorage.setItem).toHaveBeenCalledWith('numberKey', '{"a":1,"uid":2}');
      expect(store.numberKey).toEqual('{"a":1,"uid":2}');
    });

    it('should handle boolean true', () => {
      store.booleanKey = '{"a":false}';
      expect(service.injectToken('booleanKey', 'uid', true)).toBeTruthy();
      expect(localStorage.setItem).toHaveBeenCalledWith('booleanKey',
        '{"a":false,"uid":true}');
      expect(store.booleanKey).toEqual('{"a":false,"uid":true}');
    });

    it('should handle boolean false', () => {
      store.booleanKey = '{"a":true}';
      expect(service.injectToken('booleanKey', 'uid', false)).toBeTruthy();
      expect(localStorage.setItem).toHaveBeenCalledWith('booleanKey',
        '{"a":true,"uid":false}');
      expect(store.booleanKey).toEqual('{"a":true,"uid":false}');
    });

    it('should save an empty array', () => {
      store.arrayKey = '{"a":[]}';
      expect(service.injectToken('arrayKey', 'uid', [])).toBeTruthy();
      expect(localStorage.setItem).toHaveBeenCalledWith('arrayKey',
        '{"a":[],"uid":[]}');
      expect(store.arrayKey).toEqual('{"a":[],"uid":[]}');
    });

    it('should save an array with values', () => {
      store.arrayKey = '{"a":[2,"b"]}';
      expect(service.injectToken('arrayKey', 'uid', [1, 'a'])).toBeTruthy();
      expect(localStorage.setItem).toHaveBeenCalledWith('arrayKey',
        '{"a":[2,"b"],"uid":[1,"a"]}');
      expect(store.arrayKey).toEqual('{"a":[2,"b"],"uid":[1,"a"]}');
    });

    it('should save an empty object', () => {
      store.objectKey = '{"a":{}}';
      expect(service.injectToken('objectKey', 'uid', {})).toBeTruthy();
      expect(localStorage.setItem).toHaveBeenCalledWith('objectKey',
        '{"a":{},"uid":{}}');
      expect(store.objectKey).toEqual('{"a":{},"uid":{}}');
    });

    it('should save an object with values', () => {
      store.objectKey = '{"a":{"d":2}}';
      expect(service.injectToken('objectKey', 'uid', {a: 1, b: 'c'})).toBeTruthy();
      expect(localStorage.setItem).toHaveBeenCalledWith('objectKey',
        '{"a":{"d":2},"uid":{"a":1,"b":"c"}}');
      expect(store.objectKey).toEqual('{"a":{"d":2},"uid":{"a":1,"b":"c"}}');
    });
  });

  describe('injectToken to a wrong type', () => {
    it('should fail', () => {
      store.stringKey = '"test1"';
      expect(service.injectToken('stringKey', 'uid', 'test2')).toBeFalsy();
      expect(localStorage.setItem).not.toHaveBeenCalled();
      expect(store.stringKey).toEqual('"test1"');
    });
  });

  describe('removeKey', () => {
    it('should handle deletion of a missing key', () => {
      expect(service.removeKey('none')).toBeTruthy();
      expect(localStorage.removeItem).toHaveBeenCalledWith('none');
    });

    it('should remove an existing key', () => {
      store.stringKey = 'test';
      expect(service.removeKey('stringKey')).toBeTruthy();
      expect(localStorage.removeItem).toHaveBeenCalledWith('stringKey');
      expect(store.stringKey).not.toBeDefined();
    });
  });

  describe('replaceToken', () => {
    it('should fail on a missing key', () => {
      expect(service.replaceToken('none', 'uid', 'test')).toEqual('test');
      expect(localStorage.setItem).not.toHaveBeenCalled();
      expect(store.none).not.toBeDefined();
    });

    it('should fail on a wrong type', () => {
      store.stringKey = '"test1"';
      expect(service.replaceToken('stringKey', 'uid', 'test2')).toEqual('test2');
      expect(localStorage.setItem).not.toHaveBeenCalled();
      expect(store.stringKey).toEqual('"test1"');
    });

    it('should fail on a missing token', () => {
      store.objectKey = '{"a":{}}';
      expect(service.replaceToken('objectKey', 'uid', 'test')).toEqual('test');
      expect(localStorage.setItem).not.toHaveBeenCalled();
      expect(store.objectKey).toEqual('{"a":{}}');
    });

    it('should rename the token', () => {
      store.objectKey = '{"old":{"a":1}}';
      expect(service.replaceToken('objectKey', 'old', 'new')).toEqual('new');
      expect(localStorage.setItem).toHaveBeenCalledWith('objectKey',
        '{"new":{"a":1}}');
      expect(store.objectKey).toEqual('{"new":{"a":1}}');
    });
  });

  describe('removeToken', () => {
    it('should fail on a missing key', () => {
      service.removeToken('none', 'uid');
      expect(localStorage.setItem).not.toHaveBeenCalled();
      expect(store.none).not.toBeDefined();
    });

    it('should fail on a wrong type', () => {
      store.stringKey = '"test1"';
      service.removeToken('stringKey', 'uid');
      expect(localStorage.setItem).not.toHaveBeenCalled();
      expect(store.stringKey).toEqual('"test1"');
    });

    it('should fail on a missing token', () => {
      store.objectKey = '{"a":{}}';
      service.removeToken('objectKey', 'uid');
      expect(localStorage.setItem).not.toHaveBeenCalled();
      expect(store.objectKey).toEqual('{"a":{}}');
    });

    it('should rename the token', () => {
      store.objectKey = '{"old":{"a":1},"test":2}';
      service.removeToken('objectKey', 'old');
      expect(localStorage.setItem).toHaveBeenCalledWith('objectKey',
        '{"test":2}');
      expect(store.objectKey).toEqual('{"test":2}');
    });
  });
});
