import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyAssets } from './my-assets';

describe('MyAssets', () => {
  let component: MyAssets;
  let fixture: ComponentFixture<MyAssets>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyAssets]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyAssets);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
