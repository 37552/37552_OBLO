import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KycDocuments } from './kyc-documents';

describe('KycDocuments', () => {
  let component: KycDocuments;
  let fixture: ComponentFixture<KycDocuments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KycDocuments]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KycDocuments);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
