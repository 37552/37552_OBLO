import { Component, OnInit } from '@angular/core';
import { UserService } from '../../shared/user-service';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { DrawerModule } from 'primeng/drawer';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { NgClass } from '@angular/common';



@Component({
  selector: 'app-fnf-settlement',
  imports: [

    DialogModule,
    ButtonModule,
    BreadcrumbModule,
    DrawerModule,
    SelectModule,
    ReactiveFormsModule,
    InputTextModule,
    NgClass


  ],
  templateUrl: './fnf-settlement.html',
  styleUrl: './fnf-settlement.scss'
})
export class FnfSettlement implements OnInit {



  monthDrp: any;
  yearDrp: any;
  empDrp: any;
  menulabel: string = ""
  menuName: string = "Payroll"
  FormName: string = "FNF Settlement"



  visible: boolean = false;
  header = '';
  headerIcon = '';
  drawerSize: string = "";
  fnfSettlementForm!: FormGroup;
  salaryPeriodForm!: FormGroup;


  breadcrumbItems = [
    { label: this.menuName, routerLink: '/payroll' },
    { label: this.FormName, routerLink: '/payroll/fnf-settlement' },
  ];


  constructor(private userService: UserService, private fb: FormBuilder) {
    this.fnfSettlementForm = this.fb.group({
      employee: ['', Validators.required],
      empCode: [''],
      address: [''],
      so: [''],
      dept: [''],
      desg: [''],
      unit: [''],
      doj: [''],
      dol: [''],
      servicePeriod: [''],
      reason: [''],
      noticeDate: [''],
      noticeBY: [''],
      noticeWp: ['']
    })
    this.salaryPeriodForm = this.fb.group({
      dateFrom: ['', Validators.required],
      dateTo: ['', Validators.required],
      paidDays: [''],
      totalDays: [''],
      unpaid: [''],
    })
  }

  ngOnInit(): void {
    this.getMonthAndYear()
    this.getEmployee()


  }

  showDialog() {
    this.visible = true;
    this.header = "Add " + this.FormName;
    this.headerIcon = "pi pi-plus";
    this.drawerSize = "50vw";
  }




  onDrawerHide() {
    this.visible = false;
    this.header = "";
    this.headerIcon = "";
    this.drawerSize = "";
  }

  onSubmitCall() {
    this.visible = false;
    this.header = "";
    this.headerIcon = "";
    this.drawerSize = "";
  }




  getMonthAndYear() {
    this.userService.getQuestionPaper('uspGetEmployeeCtcDrp|action=MONTH').subscribe((res: any) => {
      this.monthDrp = res['table']
      this.yearDrp = res['table1']
    })
  }

  getEmployee() {
    let roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId
    this.userService.getQuestionPaper(`uspGetEmpForFNF|appUserRole=${roleID}|appUserId=${sessionStorage.getItem('userId')}`).subscribe((res: any) => {
      this.empDrp = res['table']
    })

  }

  resetForm() {
    this.fnfSettlementForm.reset();
    this.salaryPeriodForm.reset();
  }





}
