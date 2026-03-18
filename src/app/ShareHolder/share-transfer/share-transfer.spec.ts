import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareTransfer } from './share-transfer';

describe('ShareTransfer', () => {
  let component: ShareTransfer;
  let fixture: ComponentFixture<ShareTransfer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShareTransfer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShareTransfer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
