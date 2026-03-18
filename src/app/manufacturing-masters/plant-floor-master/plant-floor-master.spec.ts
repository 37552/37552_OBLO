import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantFloorMaster } from './plant-floor-master';

describe('PlantFloorMaster', () => {
  let component: PlantFloorMaster;
  let fixture: ComponentFixture<PlantFloorMaster>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlantFloorMaster]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlantFloorMaster);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
