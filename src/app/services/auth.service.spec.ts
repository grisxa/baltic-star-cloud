import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';

xdescribe('AuthService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AuthService = TestBed.inject(AuthService);
    expect(service).toBeTruthy();
  });
});