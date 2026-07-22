import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesPaiements } from './mes-paiements';

describe('MesPaiements', () => {
  let component: MesPaiements;
  let fixture: ComponentFixture<MesPaiements>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MesPaiements],
    }).compileComponents();

    fixture = TestBed.createComponent(MesPaiements);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
