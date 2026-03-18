// user-profile.component.ts

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AvatarModule } from 'primeng/avatar';
import { ConfirmationService, MessageService } from 'primeng/api';
import { LoadingService } from '../shared/loading.service';

interface User {
  empnam: string;
  personalemail: string | null;
  phone: string | null;
  userID: string;
  photopath?: string;
}

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    BreadcrumbModule,
    ButtonModule,
    InputTextModule,
    AvatarModule
  ],
  providers: [ConfirmationService, MessageService, LoadingService],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss',
})
export class UserProfile implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  profileForm!: FormGroup;
  originalData!: User;
  originalImage!: string | null;
  imagePreview: string | null = null;
  userInfo: any;
  isEditMode: boolean = false;

  breadcrumbItems = [{ label: 'Home', routerLink: '/home' }, { label: 'Profile' }];

  constructor(
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private loadingService: LoadingService,

  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.loadUserData();
  }
  showPrefix = false;
  onPhoneInput(): void {
    const control = this.profileForm.get('phone');
    let value = control?.value || '';
    value = value.replace(/\D/g, '');
    value = value.slice(0, 10);

    control?.setValue(value, { emitEvent: false });
    this.showPrefix = /^[6-9]/.test(value);
  }
  // ================= INIT FORM =================
  private initializeForm(): void {
    this.profileForm = this.fb.group({
      empnam: [{ value: '', disabled: true }, Validators.required],
      personalemail: ['', [Validators.required, Validators.email,],],
      phone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      userID: [{ value: '', disabled: true }],
      profileImage: [''],
    });
  }
  onEmailBlur(): void {
    const control = this.profileForm.get('personalemail');
    const value = control?.value;

    if (!value) return;
    if (value.includes('@')) return;

    control?.patchValue(value + '@gmail.com');
  }
  // ================= LOAD DATA =================
  private loadUserData(): void {
    const stored = sessionStorage.getItem('UserInfo');
    if (!stored) return;

    const parsed = JSON.parse(stored);
    const data: User = Array.isArray(parsed) ? parsed[0] : parsed;

    if (!data) return;

    this.originalData = data;

    this.imagePreview = data.photopath ? `data:image/png;base64,${data.photopath}` : null;

    this.originalImage = this.imagePreview;

    this.profileForm.patchValue({
      empnam: data.empnam,
      personalemail: data.personalemail,
      phone: data.phone,
      userID: data.userID,
      profileImage: this.imagePreview,
    });
  }

  // ================= IMAGE HANDLING =================
  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];

    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();

    reader.onload = () => {
      this.imagePreview = reader.result as string;

      this.profileForm.patchValue({
        profileImage: this.imagePreview,
      });
    };

    reader.readAsDataURL(file);
  }

  // ================= SUBMIT =================
  onSubmit(): void {

    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const raw = this.profileForm.getRawValue();

    const payload = {
      empnam: raw.empnam,
      personalemail: raw.personalemail,
      phone: raw.phone,
      userID: raw.userID,
      photopath: raw.profileImage
        ? raw.profileImage.split(',')[1]  // remove base64 prefix
        : null,
    };

    this.confirmationService.confirm({
      message: 'Do you want to update your profile?',
      header: 'Confirm Update',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes',
      rejectLabel: 'No',

      accept: () => {

        this.loadingService.startLoading();

        console.log('API Payload Ready:', payload);

        // 🔥 Simulate API
        setTimeout(() => {

          // Update session storage
          sessionStorage.setItem('UserInfo', JSON.stringify(raw));

          this.userInfo = raw;
          this.profileForm.disable();
          this.isEditMode = false;

          this.loadingService.stopLoading();

          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Profile updated successfully'
          });

        }, 1000);

        // 🔥 Real API Example
        // this.userService.updateProfile(payload).subscribe({
        //   next: (res) => { ... },
        //   error: (err) => { ... }
        // });
      }
    });

  }

  // ================= CANCEL =================
  onCancel(): void {
    this.profileForm.reset({
      empnam: this.originalData.empnam,
      personalemail: this.originalData.personalemail,
      phone: this.originalData.phone,
      userID: this.originalData.userID,
      profileImage: this.originalImage,
    });

    this.imagePreview = this.originalImage;
  }
}
