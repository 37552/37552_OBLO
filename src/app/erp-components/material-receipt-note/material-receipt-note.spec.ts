import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialReceiptNote } from './material-receipt-note';

describe('MaterialReceiptNote', () => {
  let component: MaterialReceiptNote;
  let fixture: ComponentFixture<MaterialReceiptNote>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialReceiptNote]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaterialReceiptNote);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
