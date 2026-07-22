import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RapportFinancier } from './rapport-financier';

describe('RapportFinancier', () => {
  let component: RapportFinancier;
  let fixture: ComponentFixture<RapportFinancier>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RapportFinancier],
    }).compileComponents();

    fixture = TestBed.createComponent(RapportFinancier);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
