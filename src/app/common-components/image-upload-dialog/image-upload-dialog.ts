import { Component, Input, Output, EventEmitter, ChangeDetectorRef, ViewChild } from '@angular/core';
import { MessageService } from 'primeng/api';
import { FileUploadService } from '../../shared/file-upload.service';
import { Dialog } from 'primeng/dialog';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { UserService } from '../../shared/user-service';


@Component({
  selector: 'app-image-upload-dialog',
  imports: [Dialog, FileUploadModule, ButtonModule],
  templateUrl: './image-upload-dialog.html',
  styleUrl: './image-upload-dialog.scss'
})
export class ImageUploadDialog {
  @Input() visible: boolean = false;               // Two-way bind from parent
  @Input() folderName: string = 'uploads';         // where to upload
  @Input() targetField: string = '';               // name of the target form control (or field)
  @Output() visibleChange = new EventEmitter<boolean>();
  // emits { field: string, url: string }
  @Output() uploadSuccess = new EventEmitter<{ field: string, url: string }>();

  @ViewChild('pu') pu: any;

  // selectedFile: File | null = null;
  selectedFile?: File;
  previewUrl: string | null = null;
  isUploading = false;

  constructor(
    private uploadService: FileUploadService,
    private message: MessageService,
    private cdr: ChangeDetectorRef,
    private userService: UserService
  ) { }

  closeDialog() {
    this.visible = false;
    this.visibleChange.emit(false);
    this.clearLocal();
  }

  clearLocal() {
    this.selectedFile = undefined;
    this.previewUrl = null;
    if (this.pu && this.pu.clear) {
      try { this.pu.clear(); } catch { }
    }
    this.cdr.detectChanges();
  }

  onFileSelect(event: any) {
    if (event?.files?.length) {
      this.selectedFile = event.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
        this.cdr.detectChanges();
      };
      // reader.readAsDataURL(this.selectedFile);
      reader.readAsDataURL(this.selectedFile!);
    }
  }

  upload() {
    if (!this.selectedFile) {
      this.message.add({ severity: 'warn', summary: 'Please select an image' });
      return;
    }
    this.isUploading = true;
    this.userService.MastrtfileuploadNew([this.selectedFile], this.folderName)
      .subscribe({
        next: (res: any) => {
          this.isUploading = false;
          const responseString = res.toString(); // backend returns string like "1-path"
          const parts = responseString.split('-');
          if (parts[0] === '1') {
            // const finalUrl = this.uploadService.normalizeImagePath(parts.slice(1).join('-'));
            
            this.message.add({ severity: 'success', summary: 'Uploaded' });
            this.uploadSuccess.emit({ field: this.targetField, url: parts[1] });
            this.closeDialog();
          } else {
            const errMsg = parts.slice(1).join('-') || 'Upload failed';
            this.message.add({ severity: 'error', summary: errMsg });
          }
        },
        error: (err) => {
          this.isUploading = false;
          this.message.add({
            severity: 'error',
            summary: 'Upload error',
            detail: err?.message || ''
          });
        }
      });
  }

}
