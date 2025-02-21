import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { nauthGuard } from './nauth.guard';

describe('nauthGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => nauthGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
