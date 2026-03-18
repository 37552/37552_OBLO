import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialReceiptNoteApproval } from './material-receipt-note-approval';

describe('MaterialReceiptNoteApproval', () => {
  let component: MaterialReceiptNoteApproval;
  let fixture: ComponentFixture<MaterialReceiptNoteApproval>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialReceiptNoteApproval]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaterialReceiptNoteApproval);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
