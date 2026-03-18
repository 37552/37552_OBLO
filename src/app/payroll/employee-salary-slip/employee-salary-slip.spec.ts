import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmployeeSalarySlip } from './employee-salary-slip';
import { UserService } from '../../shared/user-service';
import { PdfGeneratorService } from '../../shared/pdf-generator.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('EmployeeSalarySlip', () => {
  let component: EmployeeSalarySlip;
  let fixture: ComponentFixture<EmployeeSalarySlip>;

  // Mocks
  const userServiceMock = {
    getQuestionPaper: jasmine.createSpy('getQuestionPaper').and.returnValue(of({ table: [] })),
    SubmitPostTypeData: jasmine.createSpy('SubmitPostTypeData').and.returnValue(of('Data Saved.-success'))
  };

  const pdfServiceMock = {
    generatePdfFromHtmlString: jasmine.createSpy('generatePdfFromHtmlString')
  };

  const messageServiceMock = {
    add: jasmine.createSpy('add')
  };

  const confirmationServiceMock = {
    confirm: jasmine.createSpy('confirm')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        EmployeeSalarySlip,
        HttpClientTestingModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: PdfGeneratorService, useValue: pdfServiceMock },
        { provide: MessageService, useValue: messageServiceMock },
        { provide: ConfirmationService, useValue: confirmationServiceMock }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(EmployeeSalarySlip);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
