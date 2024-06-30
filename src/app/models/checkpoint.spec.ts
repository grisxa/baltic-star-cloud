import {Timestamp} from 'firebase/firestore';
import {
  CheckIns,
  Checkpoint,
  orderCheckpointsByDistance,
  orderCheckpointsByTime,
  orderCheckpointsByVisit
} from './checkpoint';
import {RoutePoint} from './route-point';

describe('Control', () => {
  it('should create an instance', () => {
    const routPoint = {
      lat: 0,
      lng: 0,
      distance: 0,
      name: 'test'
    } as RoutePoint;
    expect(new Checkpoint(routPoint)).toBeTruthy();
  });
});

describe('Checkpoint ordering', () => {
  it('should prefer closest controls', () => {
    const a: Checkpoint = {
      delta: 100
    } as Checkpoint;
    const b: Checkpoint = {
      delta: 200
    } as Checkpoint;
    expect(orderCheckpointsByDistance(a, b)).toBeLessThan(0);
  });

  it('should correctly sort checkpoints by open time', () => {
    const checkpoints: Checkpoint[] = [
      {
        uid: 'A',
        startDate: Timestamp.fromDate(new Date('2024-06-12T08:00:00Z')),
        endDate: Timestamp.fromDate(new Date('2024-06-12T16:00:00Z'))
      } as unknown as Checkpoint,
      {
        uid: 'B',
        startDate: Timestamp.fromDate(new Date('2024-06-12T10:00:00Z')),
        endDate: Timestamp.fromDate(new Date('2024-06-12T18:00:00Z'))
      } as unknown as Checkpoint,
      {
        uid: 'C',
        startDate: Timestamp.fromDate(new Date('2024-06-12T09:00:00Z')),
        endDate: Timestamp.fromDate(new Date('2024-06-12T17:00:00Z'))
      } as unknown as Checkpoint,
      {
        uid: 'D',
        startDate: Timestamp.fromDate(new Date('2024-06-12T07:00:00Z')),
        endDate: Timestamp.fromDate(new Date('2024-06-12T15:00:00Z'))
      } as unknown as Checkpoint,
      {
        uid: 'E',
        endDate: Timestamp.fromDate(new Date('2024-06-12T20:00:00Z'))
      } as unknown as Checkpoint,
      {
        uid: 'F',
        startDate: Timestamp.fromDate(new Date('2024-06-12T06:00:00Z')),
      } as unknown as Checkpoint,
      {uid: 'G'} as unknown as Checkpoint,
      {
        uid: 'H',
        startDate: Timestamp.fromDate(new Date('2024-06-12T11:00:00Z')),
        endDate: Timestamp.fromDate(new Date('2024-06-12T19:00:00Z'))
      } as unknown as Checkpoint,
      {
        uid: 'I',
        startDate: Timestamp.fromDate(new Date('2024-06-12T12:00:00Z')),
        endDate: Timestamp.fromDate(new Date('2024-06-12T20:00:00Z'))
      } as unknown as Checkpoint,
      {
        uid: 'J',
        startDate: Timestamp.fromDate(new Date('2024-06-12T07:00:00Z')),
        endDate: Timestamp.fromDate(new Date('2024-06-12T14:00:00Z'))
      } as unknown as Checkpoint,
    ];
    const currentTime = new Date('2024-06-12T11:00:00Z').getTime();
    expect(checkpoints.sort((a, b) => orderCheckpointsByTime(a, b, currentTime))
      .map(cp => cp.uid))
      .toEqual(['E', 'G', 'F', 'J', 'D', 'A', 'C', 'B', 'H', 'I']);
  });

  describe('by visit', () => {
    it('should pass as is when no history', () => {
      const checkpoints: Checkpoint[] = [
        {
          uid: 'A',
        } as unknown as Checkpoint,
        {
          uid: 'B',
        } as unknown as Checkpoint,
      ];
      expect(checkpoints.sort((a, b) => orderCheckpointsByVisit(a, b, {}))
        .map(cp => cp.uid))
        .toEqual(['A', 'B']);
    });

    it('should prefer new checkpoints', () => {
      const checkpoints: Checkpoint[] = [
        {
          uid: 'a',
        } as unknown as Checkpoint,
        {
          uid: 'b',
        } as unknown as Checkpoint,
      ];
      const checkins: CheckIns = {
        a: [Timestamp.fromDate(new Date('2024-06-12T12:00:00Z'))]
      };
      expect(checkpoints.sort((a, b) => orderCheckpointsByVisit(a, b, checkins))
        .map(cp => cp.uid))
        .toEqual(['b', 'a']);
    });

    it('should consider checkin times', () => {
      const checkpoints: Checkpoint[] = [
        {
          uid: 'a',
        } as unknown as Checkpoint,
        {
          uid: 'b',
        } as unknown as Checkpoint,
      ];
      const checkins: CheckIns = {
        a: [Timestamp.fromDate(new Date('2024-06-12T12:00:00Z'))],
        b: [Timestamp.fromDate(new Date('2024-06-12T13:00:00Z'))]
      };
      expect(checkpoints.sort((a, b) => orderCheckpointsByVisit(a, b, checkins))
        .map(cp => cp.uid))
        .toEqual(['b', 'a']);
    });

    it('should take the latest checkin', () => {
      const checkpoints: Checkpoint[] = [
        {
          uid: 'a',
        } as unknown as Checkpoint,
        {
          uid: 'b',
        } as unknown as Checkpoint,
      ];
      const checkins: CheckIns = {
        a: [Timestamp.fromDate(new Date('2024-06-12T12:00:00Z')), Timestamp.fromDate(new Date('2024-06-12T14:00:00Z'))],
        b: [Timestamp.fromDate(new Date('2024-06-12T10:00:00Z')), Timestamp.fromDate(new Date('2024-06-12T16:00:00Z'))]
      };
      expect(checkpoints.sort((a, b) => orderCheckpointsByVisit(a, b, checkins))
        .map(cp => cp.uid))
        .toEqual(['b', 'a']);
    });

  });
});
