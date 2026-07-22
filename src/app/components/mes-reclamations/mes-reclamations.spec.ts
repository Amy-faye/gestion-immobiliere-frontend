import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesReclamations } from './mes-reclamations';

describe('MesReclamations', () => {
  let component: MesReclamations;
  let fixture: ComponentFixture<MesReclamations>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MesReclamations],
    }).compileComponents();

    fixture = TestBed.createComponent(MesReclamations);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
