import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemReceive } from './item-receive';

describe('ItemReceive', () => {
  let component: ItemReceive;
  let fixture: ComponentFixture<ItemReceive>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemReceive]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItemReceive);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
