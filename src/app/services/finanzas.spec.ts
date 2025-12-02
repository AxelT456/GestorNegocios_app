import { TestBed } from '@angular/core/testing';

import { Finanzas } from './finanzas';

describe('Finanzas', () => {
  let service: Finanzas;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Finanzas);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
