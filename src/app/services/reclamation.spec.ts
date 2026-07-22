import { TestBed } from '@angular/core/testing';

import { Reclamation } from './reclamation';

describe('Reclamation', () => {
  let service: Reclamation;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Reclamation);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
