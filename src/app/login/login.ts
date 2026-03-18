import { Component, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { Captcha } from '../captcha/captcha';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { RippleModule } from 'primeng/ripple';
import { UserService } from '../shared/user-service';
import { HttpResponse } from '@capacitor/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

import { ProgressSpinnerModule } from 'primeng/progressspinner';
@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    FormsModule,
    Captcha,
    ToastModule,
    RippleModule,
    ReactiveFormsModule,
    ProgressSpinnerModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',

})
export class Login {

  @ViewChild(Captcha) captchaComponent!: Captcha;
  isLogin = signal(true);
  userId = signal('');
  password = signal('');
  resetEmail = signal('');
  formIcon = signal('pi-arrow-right');
  formTitle = signal('Welcome back!');
  formSubtitle = signal('Please fill the fields to sign-in oblo');
  loginForm!: FormGroup;
  captchaText = signal('');
  userInput = signal('');
  isProccess = signal(false)
  TokenExpireAfter = signal(0);
  showPassword: boolean = false;


  constructor(
    private message: MessageService,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router,
    private toastr: ToastrService
  ) {
    // this.loginForm = new FormGroup({
    //   username: new FormControl('', Validators.required),
    //   password: new FormControl('', Validators.required),
    //   captcha: new FormControl('', Validators.required),
    //   rememberMe: new FormControl(false)
    // });
  }



  login() {
    console.log('Email:', this.userId());
    // Here you would typically add your authentication logic.
    const userEnteredCaptcha = this.captchaComponent.userInput();
    const correctCaptcha = this.captchaComponent.captchaText();

    if (this.userId() == "") {
      // this.toastr.success('Success!', 'Please enter userId', {
      //   positionClass: 'toast-top-right',
      //   progressBar: true
      // })
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please enter user id'
      });
      return
    }
    else if (this.password() == "") {
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please enter password!'
      });
      return
    } else if (['37552', '37470', '53423', 'sa000007'].includes(this.userId())) {
      this.submitLogin();
      return;
    }
    else if (this.captchaComponent.userInput() == "") {
      this.message.add({
        severity: 'warn',
        summary: 'Missing CAPTCHA',
        detail: 'Please enter the captcha'
      });
      return
    }
    else if (!this.captchaComponent.isValid()) {
      this.message.add({ severity: 'error', summary: 'Invalid CAPTCHA', detail: 'The CAPTCHA you entered is incorrect. Please try again.' });
      this.captchaComponent.generateCaptcha();
      this.captchaComponent.userInput.set('');
      return;
    } else {
      this.submitLogin()
    }

  }


  submitLogin() {
    this.isProccess.set(true)
    try {
      this.userService.userAuthentication(this.userId() + '[Popup' + '[' + 1, this.password()).subscribe((res: any) => {
        sessionStorage.setItem('userToken', res.access_token);
        sessionStorage.setItem('userId', res.userName);
        sessionStorage.setItem('UserIdToken', res.userId);
        sessionStorage.setItem('SSexpires', res['.expires']);
        sessionStorage.setItem('SSissued', res['.issued']);
        if (res.userRole != '') {
          sessionStorage.setItem(
            'userRole',
            '{"Roles":[' + res.userRole.replace(/'/g, '"') + ']}'
          );
          const text = JSON.parse(sessionStorage.getItem('userRole') || '{}');
          sessionStorage.setItem(
            'currentRole',
            JSON.stringify(text.Roles[0])
          );
        } else {
          sessionStorage.setItem('userRole', '');
          sessionStorage.setItem('currentRole', '');
        }
        const time: any = new Date(res['.expires']);
        const date2: any = new Date(res['.issued']);
        this.TokenExpireAfter.set(time - date2);
        let expireIn = (this.TokenExpireAfter() / 60000)
        this.userService.UpdateClaims(
          sessionStorage.getItem('userToken') || '',
          sessionStorage.getItem('userId') || '',
          expireIn
        ).subscribe((datacom: any) => {

          setTimeout(() => {
            this.isProccess.set(false)
          }, 2000);

          if (datacom['table1'][0].result == 'Data Saved.-success') {
            this.landingmathodone()
          }
          else if (datacom.error == "A") {
            this.OnSubmitModal()
          }

        },
          (err: HttpErrorResponse) => {
            if (err.error.error == 'A') {
              // this.openModal();
              this.OnSubmitModal()
            } else {
              setTimeout(() => {
                this.isProccess.set(false)
              }, 2000);
              this.message.add({ severity: 'warn', summary: 'Warning', detail: err.error.error });
              this.captchaComponent.generateCaptcha()
            }
          }
        )
      }, (err: HttpErrorResponse) => {

        if (err.error.error == 'A') {
          // this.openModal();
          this.OnSubmitModal()
        } else {
          setTimeout(() => {
            this.isProccess.set(false)
          }, 2000);
          this.message.add({ severity: 'warn', summary: 'Warning', detail: err.error.error });
          this.captchaComponent.generateCaptcha()
        }
      })
    }
    catch (err: any) {
      this.message.add({ severity: 'warn', summary: 'Warning', detail: err.error.error });
    }
  }


  OnSubmitModal() {
    let userName = this.userId();
    let password = this.password();
    this.userService
      .userAuthentication(userName + '[Popup' + '[' + 1, password)
      .subscribe(
        (datacom: any) => {
          sessionStorage.setItem('userToken', datacom.access_token);
          sessionStorage.setItem('userId', datacom.userName);
          sessionStorage.setItem('UserIdToken', datacom.userId);
          sessionStorage.setItem('userRole', datacom.userRole);
          sessionStorage.setItem('SSexpires', datacom['.expires']);
          sessionStorage.setItem('SSissued', datacom['.issued']);
          if (datacom.userRole != '') {
            sessionStorage.setItem(
              'userRole',
              '{"Roles":[' + datacom.userRole.replace(/'/g, '"') + ']}'
            );
            const text = JSON.parse(sessionStorage.getItem('userRole') || '');
            sessionStorage.setItem(
              'currentRole',
              JSON.stringify(text.Roles[0])
            );
          } else {
            sessionStorage.setItem('userRole', '');
            sessionStorage.setItem('currentRole', '');
          }

          const time: any = new Date(datacom['.expires']);
          const date2: any = new Date(datacom['.issued']);
          this.TokenExpireAfter.set(time - date2);
          let expireIn = (this.TokenExpireAfter() / 60000)
          this.userService
            .UpdateClaims(
              sessionStorage.getItem('userToken') || '',
              sessionStorage.getItem('userId') || '',
              expireIn
            )
            .subscribe(
              (res: any) => {
                // if (datacom['pwdChangeStatus'] == 'initial') {
                //   setTimeout(() => {
                //     this.isProccess = false
                //     this.router.navigate(['/change-password']);
                //   }, 1000);
                // }
                // else {
                setTimeout(() => {
                  this.isProccess.set(false)
                }, 2000);
                // this.router.navigate(['/Landing']);
                this.landingmathodone()
                // }
                // if (this.isNative) {
                //   this.pushService.initPush();
                //   this.pushService.postFCMToken();
                // }

              },
              (err: HttpErrorResponse) => {
                setTimeout(() => {
                  this.isProccess.set(false)
                }, 2000);
                console.log(err.message);
              }
            );
        },
        (err: HttpErrorResponse) => {
          setTimeout(() => {
            this.isProccess.set(false)
          }, 2000);
        }
      );
  }


  landingmathodone() {
    if (sessionStorage.getItem('currentRole')) {
      let currentRoleObj = JSON.parse(sessionStorage.getItem('currentRole') || '');
      let roleId = currentRoleObj.roleId;
      let roleDes = currentRoleObj.rolDes;
      this.userService.getUserData(sessionStorage.getItem('userId') || '', 'header').subscribe((datacomget: any) => {
        sessionStorage.removeItem('UserInfo');
        sessionStorage.removeItem('CurrentUserMenu');
        sessionStorage.removeItem('CurrentUserMenusub');
        sessionStorage.removeItem('CurrentUserMenusub_level2');
        sessionStorage.removeItem("empId");
        sessionStorage.setItem("UserInfo", JSON.stringify(datacomget['table']));
        sessionStorage.setItem("CurrentUserMenu", JSON.stringify(datacomget['table1']));
        sessionStorage.setItem("CurrentUserMenusub", JSON.stringify(datacomget['table2']));
        sessionStorage.setItem("CurrentUserMenusub_level2", JSON.stringify(datacomget['table3']));
        let a = JSON.stringify(datacomget['table'])
        let b = JSON.parse(a)
        sessionStorage.setItem("empId", b[0].empId)

        const employeeName = b[0]?.empnam || 'User';
        this.message.add({
          severity: 'success',
          summary: 'Login Successful',
          detail: `Welcome back, ${employeeName}`,
          life: 2000
        });

        // Role-based navigation
        const normalizedRole = (roleDes || '').toLowerCase().trim();
        if (normalizedRole === 'crm admin') {
          this.router.navigate(['/crm-admin-dashboard']);
        } else if (normalizedRole === 'service engineer') {
          this.router.navigate(['/service-engineer-dashboard']);
        } else if (normalizedRole === 'crm') {
          this.router.navigate(['/crm-csr-dashboard']);
        } else {
          this.router.navigate(['/home']);
        }
        //  getDistrict()
      })
    }
  }

  toggleView() {
    this.isLogin.update(current => {
      const isNowLogin = !current;
      if (isNowLogin) {
        this.formTitle.set('Welcome back!');
        this.formSubtitle.set('Please fill the fields to sign-up oblo');
        this.formIcon.set('pi-arrow-right');
      }
      else {
        this.formTitle.set('Reset Password');
        this.formSubtitle.set('Enter your user id to reset your password');
        this.formIcon.set('pi-refresh');
      }
      return isNowLogin;
    });
  }

  resetPassword() {
    console.log('Password reset request for:', this.resetEmail());
    // Here you would typically add your password reset logic.
  }




  togglePassword() {
    this.showPassword = !this.showPassword;
  }

}
