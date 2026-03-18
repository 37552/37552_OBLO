import { Injectable } from '@angular/core';
import { Router } from '../../../node_modules/@angular/router';
import { Capacitor } from '@capacitor/core';
import { ConfigService } from './config.service';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable({
    providedIn: 'root'
})

export class Customvalidation {
    isNative: boolean = false;

    constructor(private router: Router, private configService: ConfigService) {
        this.isNative = Capacitor.isNativePlatform();
    }
    public loginroute(errorms: any) {
        if (errorms == 401 || errorms == 403) {
            sessionStorage.clear();
            // if (this.configService.appTitle == 'ICOMS-Integrated City O&M Solutions' && !this.isNative) {
            //     const url = "https://www.nobilitasinfotech.com/";
            //     window.location.href = url;
            //     return
            // }
            this.router.navigate(['/login']);


            return false;
        }

        return

    }
}


export function noInvalidPipelineName(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const raw = control.value;
      const value = (raw !== null && raw !== undefined) ? String(raw).trim() : '';
  
      if (!value || /^[.]+$/.test(value)) {
        return { invalidValue: true };
      }
  
      if (!/[a-zA-Z0-9]/.test(value)) {
        return { noAlphaNumeric: true };
      }
  
      return null; // ✅ Valid
    };
  }



export function nonMandatoryFieldValidation(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const rawValue = control.value || '';
    const trimmedValue = rawValue.trim();

    if (rawValue && trimmedValue === '') {
      return { invalidValue: true };
    }

    // 🔹 If field is fully empty (no input at all) → valid
    if (!rawValue) {
      return null;
    }

    if (/^[.]+$/.test(trimmedValue)) {
      return { invalidValue: true };
    }

    if (!/[a-zA-Z0-9]/.test(trimmedValue)) {
      return { noAlphaNumeric: true };
    }

    return null; // ✅ Valid
  };
}


export function validTimeFormat(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value ? control.value.trim() : '';

    // Empty or only spaces not allowed
    if (!value || value === ':' || /^[.:\s]+$/.test(value)) {
      return { invalidValue: true };
    }

    // Valid time format: 12-hour format with AM/PM
    const regex = /^(0[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i;
    if (!regex.test(value)) {
      return { invalidFormat: true };
    }

    return null; // ✅ valid
  };
}

export function noWhitespaceValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value && typeof value === 'string' && value.trim().length === 0) {
      return { whitespace: true };
    }
    return null;
  };
}


export function requiredCheckboxValue(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    return control.value === 1 ? null : { required: true };
  };
}

export function salesOrderValidator(): ValidatorFn {
  return (control: AbstractControl) => {
    const value = control.value;

    if (value === null || value === undefined) {
      return null;
    }

    const str = String(value);

    // Case 1: Only spaces or only dots
    if (/^[.\s]+$/.test(str)) {
      return { invalidValue: true };
    }

    // Case 2: No alphanumeric character
    if (!/[a-zA-Z0-9]/.test(str)) {
      return { noAlphaNumeric: true };
    }

    return null;
  };

}



