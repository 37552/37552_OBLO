import { Component } from '@angular/core';
import { TableTemplate, TableColumn } from '../table-template/table-template';
import { ButtonModule } from 'primeng/button';
import { Popover } from 'primeng/popover';
import { Tooltip } from "primeng/tooltip";
import { Dialog } from 'primeng/dialog';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { CardModule } from 'primeng/card';
import { DrawerModule } from 'primeng/drawer';
@Component({
  selector: 'app-demo',
  imports: [
    TableTemplate,
    CardModule,
    ButtonModule,
    DrawerModule,
    Popover,
    Tooltip,
    // Dialog,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    SelectModule,
    DatePickerModule
  ],
  templateUrl: './demo.html',
  styleUrl: './demo.scss'
})
export class Demo {
  isLoading = true;
  visible: boolean = false;
  isView: String = ''
  header: any = ''
  demoForm: FormGroup;
  selectedIndex: any = []
  demoOptions: any[] = [
    { label: 'Option 1', value: 'option1' },
    { label: 'Option 2', value: 'option2' },
    { label: 'Option 3', value: 'option3' }
  ];

  contacts = [
    { id: 1, initials: 'ZZ', name: 'Zuraiz Zafar', email: 'trungkienspktnd@gmail.com', phone: '(884) 555-0102', dateAdded: '2014-03-14', lastActivity: '2023-01-15', demo: 'hahha' },
    { id: 2, initials: 'SU', name: 'Sami Ullah', email: 'manhhachikt08@gmail.com', phone: '(316) 555-0116', dateAdded: '2014-03-14', lastActivity: '2023-02-20', demo: 'hahha' },
    { id: 3, initials: 'CW', name: 'Cameron Williamson', email: 'ckctm12@gmail.com', phone: '(225) 555-0118', dateAdded: '2014-03-14', lastActivity: '2022-11-10', demo: 'hahha' },
    { id: 4, initials: 'KM', name: 'Kathryn Murphy', email: 'nvt.llsst.nute@gmail.com', phone: '(405) 555-0128', dateAdded: '2014-03-14', lastActivity: '2023-03-01', demo: 'hahha' },
    { id: 5, initials: 'RE', name: 'Ralph Edwards', email: 'danghoang@hi@gmail.com', phone: '(702) 555-0122', dateAdded: '2014-03-14', lastActivity: '2022-12-05', demo: 'hahha' },
    { id: 6, initials: 'JJ', name: 'Jacob Jones', email: 'vuhaithuongnute@gmail.com', phone: '(603) 555-0123', dateAdded: '2014-03-14', lastActivity: '2023-04-01', demo: 'hahha' },
    { id: 7, initials: 'SN', name: 'Savannah Nguyen', email: 'thuhuong.nute@gmail.com', phone: '(270) 555-0117', dateAdded: '2014-03-14', lastActivity: '2023-01-25', demo: 'hahha' },
    { id: 8, initials: 'LA', name: 'Leslie Alexander', email: 'tranhtuy.nute@gmail.com', phone: '(207) 555-0119', dateAdded: '2014-03-14', lastActivity: '2022-10-15', demo: 'hahha' },
    { id: 9, initials: 'EH', name: 'Esther Howard', email: 'manhhachikt08@gmail.com', phone: '(603) 555-0123', dateAdded: '2014-03-14', lastActivity: '2023-02-14', demo: 'hahha' },
    { id: 10, initials: 'AM', name: 'Arlene McCoy', email: 'tienlapspktnd@gmail.com', phone: '(907) 555-0101', dateAdded: '2014-03-14', lastActivity: '2022-09-01', demo: 'hahha' },
    { id: 11, initials: 'DR', name: 'Dianne Russell', email: 'thuhuong.nute@gmail.com', phone: '(316) 555-0116', dateAdded: '2014-03-14', lastActivity: '2023-03-20', demo: 'hahha' },
    { id: 12, initials: 'AF', name: 'Albert Flores', email: 'vuhaithuongnute@gmail.com', phone: '(307) 555-0133', dateAdded: '2014-03-14', lastActivity: '2022-11-25', demo: 'hahha' },
    { id: 13, initials: 'KW', name: 'Kristin Watson', email: 'binhhan628@gmail.com', phone: '(252) 555-0126', dateAdded: '2014-03-14', lastActivity: '2023-04-10', demo: 'hahha' },
    { id: 14, initials: 'GH', name: 'Guy Hawkins', email: 'tranhtuy.nute@gmail.com', phone: '(229) 555-0109', dateAdded: '2014-03-14', lastActivity: '2022-12-18', demo: 'hahha' }
  ];
  contactColumns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true },// Define the Action column
    { key: 'initials', header: 'Initials', isVisible: true, isSortable: false },
    { key: 'name', header: 'Contact', isVisible: true, isSortable: true },
    { key: 'email', header: 'Email', isVisible: true, isSortable: true },
    { key: 'phone', header: 'Phone No', isVisible: true, isSortable: false },
    { key: 'dateAdded', header: 'Date Added', isVisible: true, isSortable: true },
    { key: 'demo', header: 'Demo', isVisible: true, isSortable: true },
  ];

  constructor(private fb: FormBuilder) {
    this.demoForm = this.fb.group({
      initials: ['', Validators.required],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      dateAdded: ['', Validators.required],
      demo: ['', Validators.required]
    });
  }

  get f() { return this.demoForm.controls }

  ngOnInit(): void {
    // this.contactService.getContacts().subscribe(data => {
    // this.contacts = data;
    // });

    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }


  showDialog(view: string, data: any) {
    this.visible = true;
    this.isView = view
    this.header = view === 'add' ? 'Add Data' : (view === 'update' ? 'Update Data' : 'View Data');
    this.selectedIndex = data
    if (view == 'view') {
      this.demoForm.disable()
      this.demoForm.patchValue({
        initials: data.initials ? data.initials : '',
        name: data.name ? data.name : '',
        email: data.email ? data.email : '',
        phone: data.phone ? data.phone : '',
        dateAdded: data.dateAdded ? new Date(data.dateAdded) : '',
        demo: data.demo ? data.demo : ''
      })
    } else if (view == 'update') {
      this.demoForm.enable()
      this.demoForm.patchValue({
        initials: data.initials ? data.initials : '',
        name: data.name ? data.name : '',
        email: data.email ? data.email : '',
        phone: data.phone ? data.phone : '',
        dateAdded: data.dateAdded ? new Date(data.dateAdded) : '',
        demo: data.demo ? data.demo : ''
      })
    } else {
      this.demoForm.enable()
    }
    document.body.style.overflow = 'hidden'
  }

  onDrawerHide() {
    document.body.style.overflow = 'visible'; // restore scroll
    this.demoForm.disable()
    this.demoForm.reset()
  }


  isInvalid(field: string): boolean {
    const control = this.demoForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }


  async onSubmit() {
    // this.isLoading = true
    let obj: any = {
      initials: this.demoForm.get('initials')?.value ? this.demoForm.get('initials')?.value : '',
      name: this.demoForm.get('name')?.value ? this.demoForm.get('name')?.value : '',
      email: this.demoForm.get('email')?.value ? this.demoForm.get('email')?.value : '',
      phone: this.demoForm.get('phone')?.value ? this.demoForm.get('phone')?.value : '',
      dateAdded: this.demoForm.get('dateAdded')?.value ? (new Date(this.demoForm.get('dateAdded')?.value)).toString() : '',
      demo: this.demoForm.get('demo')?.value ? this.demoForm.get('demo')?.value : ''
    }
    if (this.isView == 'update') {
      this.selectedIndex
      this.contacts
      this.contacts = this.contacts.map(contact =>
        contact.id === this.selectedIndex.id ? { ...contact, ...obj } : contact
      );
      setTimeout(async () => {
        this.isLoading = false
      }, 1000);
    } else {
      this.contacts.push(obj)
    }

    this.visible = false
  }
}
