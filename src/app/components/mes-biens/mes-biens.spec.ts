import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesBiens } from './mes-biens';

describe('MesBiens', () => {
  let component: MesBiens;
  let fixture: ComponentFixture<MesBiens>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MesBiens],
    }).compileComponents();

    fixture = TestBed.createComponent(MesBiens);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
