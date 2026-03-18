import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItempricelistMaster } from './itempricelist-master';

describe('ItempricelistMaster', () => {
  let component: ItempricelistMaster;
  let fixture: ComponentFixture<ItempricelistMaster>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItempricelistMaster]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItempricelistMaster);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
