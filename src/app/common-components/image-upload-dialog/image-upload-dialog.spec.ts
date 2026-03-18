import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageUploadDialog } from './image-upload-dialog';

describe('ImageUploadDialog', () => {
  let component: ImageUploadDialog;
  let fixture: ComponentFixture<ImageUploadDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageUploadDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageUploadDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
