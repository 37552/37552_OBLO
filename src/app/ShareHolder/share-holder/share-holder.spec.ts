import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareHolder } from './share-holder';

describe('ShareHolder', () => {
  let component: ShareHolder;
  let fixture: ComponentFixture<ShareHolder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShareHolder]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShareHolder);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
