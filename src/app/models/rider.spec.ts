import {ProviderDetails, ProviderInfo, Rider} from './rider';
import {User} from 'firebase/auth';

describe('Rider', () => {
  it('should create an instance', () => {
    expect(new Rider('1', '2', '3')).toBeTruthy();
  });


  describe('copyProviders', () => {
    const dummy = new Rider('c3', 'd4');
    let rider: Rider;

    beforeEach(() => {
      rider = new Rider('a1', 'b2');
      spyOn(rider, 'overwriteBalticStar').and.returnValue(dummy);
    });

    it('should ignore empty list', () => {
      const user = {providerData: []} as unknown as User;

      rider.copyProviders(user);

      expect(rider.providers).toEqual([]);
      expect(rider.overwriteBalticStar).not.toHaveBeenCalled();
    });

    it('should ignore undefined data', () => {
      const user = {providerData: [undefined]} as unknown as User;

      rider.copyProviders(user);

      expect(rider.providers).toEqual([]);
      expect(rider.overwriteBalticStar).not.toHaveBeenCalled();
    });

    it('should add missing provider', () => {
      const user = { providerData: [{providerId: 'any'}]} as User;

      rider.copyProviders(user);

      expect(rider.providers).toEqual([{
        providerId: 'any'
      }]);
      expect(rider.overwriteBalticStar).toHaveBeenCalledOnceWith({providerId: 'any'}, undefined);
    });

    it('should skip existing provider', () => {
      rider.providers = [{providerId: 'any'}];
      const user = { providerData: [{providerId: 'any'}]} as User;

      rider.copyProviders(user);

      expect(rider.providers).toEqual([{
        providerId: 'any'
      }]);
      expect(rider.overwriteBalticStar).not.toHaveBeenCalled();
    });
  });

  describe('overwriteBalticStar', () => {
    it('should keep info unchanged', () => {
      const rider = new Rider('a1', 'b2');

      expect(rider.overwriteBalticStar()).toEqual(rider);
    });

    it('should ignore other providers', () => {
      const rider = new Rider('a1', 'b2');
      const info = {providerId: 'any'};

      expect(rider.overwriteBalticStar(info)).toEqual(rider);
    });

    it('should copy name', () => {
      const rider = new Rider('a1', 'b2');
      const info = {providerId: 'oidc.balticstar', displayName: 'John Doe'};
      const expected = Rider.fromDoc({
        owner: 'a1',
        uid: 'b2',
        firstName: 'John',
        lastName: 'Doe',
        displayName: 'John Doe'
      } as Rider);

      expect(rider.overwriteBalticStar(info)).toEqual(expected);
    });

    it('should override profile', () => {
      /* eslint @typescript-eslint/naming-convention: "warn" */
      const rider = new Rider('a1', 'b2');
      const info: ProviderInfo = {providerId: 'oidc.balticstar', displayName: 'John Doe'};
      const profile: ProviderDetails = {given_name: 'Jim', family_name: 'Bim', name: 'Jim Bim'} as ProviderDetails;
      const expected = Rider.fromDoc({
        owner: 'a1',
        uid: 'b2',
        firstName: 'Jim',
        lastName: 'Bim',
        displayName: 'Jim Bim'
      } as Rider);

      expect(rider.overwriteBalticStar(info, profile)).toEqual(expected);
    });
  });

});
