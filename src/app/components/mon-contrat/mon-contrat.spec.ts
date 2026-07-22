import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonContrat } from './mon-contrat';

describe('MonContrat', () => {
  let component: MonContrat;
  let fixture: ComponentFixture<MonContrat>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonContrat],
    }).compileComponents();

    fixture = TestBed.createComponent(MonContrat);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
