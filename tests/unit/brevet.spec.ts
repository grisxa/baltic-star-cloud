import Brevet from '@/models/brevet';
import chai from 'chai';
import spies from 'chai-spies';

chai.use(spies);
const {expect} = chai;

// the New Year of 2021
const now = chai.spy.on(Date, 'now', () => 1609448400000);

describe('Brevet', () => {
  it('should not fail if no options given', () => {
    const brevet = new Brevet({} as Brevet);
    // eslint-disable-next-line no-unused-expressions
    expect(brevet).to.be.instanceof(Brevet);
  });

  it('should create an instance', () => {
    // eslint-disable-next-line no-unused-expressions
    expect(new Brevet({
      uid: '1',
      name: 'test',
      length: 200,
      startDate: new Date('2021-06-19 06:00:00 GMT'),
    } as Brevet)).to.be.instanceof(Brevet);
  });

  it('should copy name', () => {
    const brevet = new Brevet({name: 'test'} as Brevet);
    expect(brevet.name).to.equal('test');
  });

  it('should copy uid option', () => {
    const brevet = new Brevet({uid: '1'} as Brevet);
    expect(brevet.uid).to.equal('1');
  });

  it('should copy length option', () => {
    const brevet = new Brevet({length: 200} as Brevet);
    expect(brevet.length).to.equal(200);
  });

  it('should copy startDate option', () => {
    const date = new Date('2021-06-19 06:00:00 GMT');
    const brevet = new Brevet({startDate: date} as Brevet);
    expect(brevet.startDate).to.equal(date);
  });

  describe('Online brevet detection', () => {
    it('skip the brevet without a startDate', () => {
      const brevet = new Brevet({uid: '1', name: 'test', length: 200} as Brevet);
      // eslint-disable-next-line no-unused-expressions
      expect(brevet.isOnline()).to.be.false;
    });

    it('skip new brevets', () => {
      const brevet = new Brevet({
        uid: '1',
        name: 'test',
        length: 200,
        startDate: new Date(1609500000000),
      } as Brevet);
      // eslint-disable-next-line no-unused-expressions
      expect(brevet.isOnline()).to.be.false;
    });

    it('should skip finished brevets', () => {
      const brevet = new Brevet({
        uid: '1',
        name: 'test',
        length: 200,
        startDate: new Date(1609400000000),
        endDate: new Date(1609430000000),
      } as Brevet);
      // eslint-disable-next-line no-unused-expressions
      expect(brevet.isOnline(), 'offline status').to.be.false;
      // eslint-disable-next-line no-unused-expressions
      expect(now, 'current date compared').to.have.been.called;
    });

    it('should catch ongoing brevets with endDate behind', () => {
      const brevet = new Brevet({
        uid: '1',
        name: 'test',
        length: 200,
        startDate: new Date(1609000000000),
        endDate: new Date(1609500000000),
      } as Brevet);
      // eslint-disable-next-line no-unused-expressions
      expect(brevet.isOnline(), 'online status').to.be.true;
      // eslint-disable-next-line no-unused-expressions
      expect(now, 'current date compared').to.have.been.called;
    });

    it('should skip a finished brevet by distance', () => {
      const brevet = new Brevet({
        uid: '1',
        name: 'test',
        length: 100,
        startDate: new Date(1609400000000),
      } as Brevet);
      // eslint-disable-next-line no-unused-expressions
      expect(brevet.isOnline(), 'offline status').to.be.false;
      // eslint-disable-next-line no-unused-expressions
      expect(now, 'current date compared').to.have.been.called;
    });

    it('should catch an ongoing brevet by distance', () => {
      const brevet = new Brevet({
        uid: '1',
        name: 'test',
        length: 200,
        startDate: new Date(1609400000000),
      } as Brevet);
      // eslint-disable-next-line no-unused-expressions
      expect(brevet.isOnline(), 'offline status').to.be.true;
      // eslint-disable-next-line no-unused-expressions
      expect(now, 'current date compared').to.have.been.called;
    });

    it('should catch ongoing brevets by a week since', () => {
      const brevet = new Brevet({
        uid: '1',
        name: 'test',
        startDate: new Date(1609400000000),
      } as Brevet);
      // eslint-disable-next-line no-unused-expressions
      expect(brevet.isOnline(), 'online status').to.be.true;
      // eslint-disable-next-line no-unused-expressions
      expect(now, 'current date compared').to.have.been.called;
    });
  });
});
