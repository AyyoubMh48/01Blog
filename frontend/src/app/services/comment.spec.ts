import { TestBed } from '@angular/core/testing';

import { Commen } from './commen';

describe('Commen', () => {
  let service: Commen;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Commen);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
