import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { UserService } from '../../shared/user-service';
import { FormBuilder, FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Customvalidation } from '../../shared/Validation';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables, ChartConfiguration } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-erp-dashboard',
  imports: [BaseChartDirective, CommonModule, FormsModule],
  templateUrl: './erp-dashboard.html',
  styleUrl: './erp-dashboard.scss'
})
export class ErpDashboard {
  purchase: any = {};
  inverntoryCardData = []
  cardsData: any = {};
  mrData: any = {};
  miData: any = {};
  prData: any = {};
  poData: any = {};
  mrnData: any = {};
  inward: any = {};
  outward: any = {};

  isLoading: boolean = false
  warehouseDetails: any[] = [];
  searchText: string = '';
  displayDialog = false;
  dialogTitle = '';
  dialogContent = '';
  activeTab: string = 'dashboard';
  selectedType = '';
  warehouseList: any[] = [];
  showWarehouseDetail = false;
  selectedWarehouse: any = null;
  showWarehousePage = false;

  displayDetailModal = false;
  selectedLabel = '';
  selectedValue = 0;

  detailList: any[] = [];
  searchDetailText: string = '';

  totalPending = 241;
  piechartdata: { x: string; y: number }[] = [];
  xAxis: any;
  modalData = []
  showWarehouse: boolean = false;

  mrDonutData: any[] = [];
  miDonutData: any[] = [];
  prDonutData: any[] = [];
  poDonutData: any[] = [];
  mrnDonutData: any[] = [];
 

  pendingList = [
    {
      title: 'Purchase Request',
      date: '12 Feb',
      description: 'New purchase request pending approval'
    },
    {
      title: 'Material Issue',
      date: '13 Feb',
      description: 'Material issue waiting for confirmation'
    }
  ];


  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private Customvalidation: Customvalidation,
    private cdr: ChangeDetectorRef,
    private message: MessageService,
  ) { }


  ngOnInit(): void {
    this.getWareHouseData()
    this.getDashboardERP()
  }

  openDialog(type: string) {
    if (type === 'warehouse') {
      this.showWarehousePage = true;

      this.warehouseList = [
        { name: 'LSL Noida Store', asset: 785, qty: 18314.6, value: 53172480.08 },
        { name: 'LSL PCMC Store', asset: 730, qty: 24534, value: 235648410.04 },
        { name: 'LSL Bilaspur Store', asset: 875, qty: 23000.7, value: 7098902.17 },
        { name: 'LSL Prayagraj Store', asset: 865, qty: 34167.5, value: 9015082.76 },
        { name: 'LSL VPT Store', asset: 367, qty: 7441, value: 26527504.04 },
        { name: 'LSL Ranchi Store', asset: 508, qty: 9953, value: 56395343.9 }
      ];
    }
  }


  get filteredWarehouseData() {
    if (!this.searchText) {
      return this.warehouseDetails;
    }

    const search = this.searchText.toLowerCase();

    return this.warehouseDetails.filter(item =>
      item.item.toLowerCase().includes(search) ||
      item.warehouse.toLowerCase().includes(search)
    );
  }

  get filteredDetailList() {
    if (!this.searchDetailText) {
      return this.detailList;
    }

    const search = this.searchDetailText.toLowerCase();

    return this.detailList.filter(item =>
      item.item.toLowerCase().includes(search) ||
      item.qty.toString().includes(search) ||
      item.rate.toString().includes(search) ||
      item.value.toString().includes(search)
    );
  }


  cards = [
    {
      title: 'Material Request',
      total: 25,
      flipped: false,
      data: [
        { label: 'Pending Approval', value: 10 },
        { label: 'Pending', value: 8 },
        { label: 'Partial Pending', value: 7 }
      ]
    },
    {
      title: 'Material Issue',
      total: 15,
      flipped: false,
      data: [
        { label: 'Pending Approval', value: 5 },
        { label: 'Pending PR', value: 10 }
      ]
    },
    {
      title: 'Purchase Request',
      total: 18,
      flipped: false,
      data: [
        { label: 'Pending PR', value: 11 },
        { label: 'Partial Pending', value: 7 }
      ]
    },
    {
      title: 'Purchase Order',
      total: 30,
      flipped: false,
      data: [
        { label: 'Pending Approval', value: 12 },
        { label: 'Partial Pending', value: 9 },
        { label: 'Pending MRN', value: 9 }
      ]
    },
    {
      title: 'MRN',
      total: 12,
      flipped: false,
      data: [
        { label: 'Pending Approval', value: 6 },
        { label: 'Pending Inspection', value: 6 }
      ]
    }
  ];


  toggleFlip(card: any) {
    card.flipped = !card.flipped;
  }

  closeDetailModal() {
    this.displayDetailModal = false;
  }


  openDetail(label: string, value: number, event: Event) {
    event.stopPropagation();

    this.selectedLabel = label;
    this.selectedValue = value;
    this.displayDetailModal = true;

    this.detailList = [
      { item: 'Item 1', qty: 10, rate: 100, value: 1000 },
      { item: 'Item 2', qty: 5, rate: 200, value: 1000 },
      { item: 'Item 3', qty: 8, rate: 150, value: 1200 },
      { item: 'Item 4', qty: 12, rate: 90, value: 1080 },
      { item: 'Item 5', qty: 20, rate: 50, value: 1000 }
    ];
  }


  openWarehouseDetail(item: any) {
    this.selectedWarehouse = item;
    this.displayDialog = true;

    // Dummy table data
    this.warehouseDetails = [
      { warehouse: 'LSL PCMC', item: 'Item 1', qty: 120, rate: 50, value: 6000 },
      { warehouse: 'LSL PCMC', item: 'Item 2', qty: 80, rate: 70, value: 5600 },
      { warehouse: 'LSL PCMC', item: 'Item 3', qty: 200, rate: 40, value: 8000 },
      { warehouse: 'LSL PCMC', item: 'Item 4', qty: 150, rate: 60, value: 9000 },
      { warehouse: 'LSL PCMC', item: 'Item 5', qty: 300, rate: 30, value: 9000 }
    ];
  }



  goBack() {
    this.showWarehousePage = false;
  }

  closeDialog() {
    this.displayDialog = false;
  }


  barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'ERP Data',
        backgroundColor: '#3b82f6'
      }
    ]
  };

  pieChartData1: ChartConfiguration<'pie'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          '#81ecec',
          '#ffeaa7',
          '#fab1a0',
          '#a29bfe',
          '#55efc4'
        ]
      }
    ]
  };

  pieChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        position: 'right',   // 👈 right side
        labels: {
          boxWidth: 12,
          padding: 15
        }
      }
    }
  };


  getWareHouseData() {
    this.userService.getQuestionPaper(
      `uspGetERPDashboardData|districtId=${sessionStorage.getItem('District')}|appUserId=${sessionStorage.getItem('userId')}`
    )
      .subscribe((res: any) => {
        this.cardsData = res['table'][0];
        this.purchase = res['table4'][0];
        this.inward = res['table2'][0];
        this.outward = res['table3'][0];
console.log("cardsData=====",this.cardsData);


        const purchase = Number(this.purchase?.purchaseCnt) || 0;
        const inward = Number(this.inward?.inward) || 0;
        const outward = Number(this.outward?.amount) || 0; 
        const warehouse = Number(this.cardsData?.warehouse) || 0;

        this.piechartdata = [
          { x: 'Sales', y: 0 },
          { x: 'Purchase', y: purchase },
          { x: 'Inward', y: inward },
          { x: 'Outward', y: outward },
          { x: 'Warehouse', y: warehouse }
        ];

        const labels = this.piechartdata.map(item => item.x);
        const data = this.piechartdata.map(item => item.y);

        this.barChartData = {
          labels: labels,
          datasets: [
            {
              data: data,
              label: 'ERP Data',
              backgroundColor: '#3b82f6'
            }
          ]
        };

        this.pieChartData1 = {
          labels: labels,
          datasets: [
            {
              data: data,
              backgroundColor: [
                '#81ecec',
                '#ffeaa7',
                '#fab1a0',
                '#a29bfe',
                '#55efc4'
              ]
            }
          ]
        };

        this.cdr.detectChanges();

      });
  }

  getDashboardERP() {
    this.userService.getQuestionPaper(`uspDashboardERP`)
      .subscribe((res: any) => {
        console.log("agadgdag=========",res);
        
        setTimeout(() => {
          this.isLoading = false
        }, 1000);
        this.mrData = res['table'][0]
        this.miData = res['table1'][0]
        this.prData = res['table2'][0]
        this.poData = res['table3'][0]
        this.mrnData = res['table4'][0]
        this.setDonutChart();

      },
        (err: HttpErrorResponse) => {
          if (err.status == 403) {
            this.Customvalidation.loginroute(err.status);
          }
        }
      );
  }

  setDonutChart() {
    this.mrDonutData = [
      { x: 'Pending Approval', y: this.mrData?.pendingForApp || 0, text: (this.mrData?.pendingForApp || 0).toString(), color: '#FF9D23' },
      { x: 'Pending', y: this.mrData?.pendingMr || 0, text: (this.mrData?.pendingMr || 0).toString(), color: '#33A1E0' },
      { x: 'Partial Pending', y: this.mrData?.partialPendingMr || 0, text: (this.mrData?.partialPendingMr || 0).toString(), color: '#C5172E' }
    ];

    this.miDonutData = [
      { x: 'Pending Approval', y: this.miData?.pendingMiForApp || 0, text: (this.miData?.pendingMiForApp || 0).toString(), color: '#41B06E' },
      { x: 'Pending Partial', y: this.miData?.pendingMiForPr || 0, text: (this.miData?.pendingMiForPr || 0).toString(), color: '#FFD700' }
    ];

    this.prDonutData = [
      { x: 'Pending PR', y: this.prData?.pendingPR || 0, text: (this.prData?.pendingPR || 0).toString(), color: '#c4b660' },
      { x: 'Pending Partial', y: this.prData?.partialPendingPr || 0, text: (this.prData?.partialPendingPr || 0).toString(), color: '#0f6cbd' }
    ];

    this.poDonutData = [
      { x: 'Pending Approval', y: this.poData?.pendingPoForApp || 0, text: (this.poData?.pendingPoForApp || 0).toString(), color: '#F266AB' },
      { x: 'Partial Pending', y: this.poData?.partialPendingPoForMrn || 0, text: (this.poData?.partialPendingPoForMrn || 0).toString(), color: '#0A97B0' },
      { x: 'Pending Order', y: this.poData?.pendingPoForMrn || 0, text: (this.poData?.pendingPoForMrn || 0).toString(), color: '#4D2D8C' }
    ];

    this.mrnDonutData = [
      { x: 'Pending Approval', y: this.mrnData?.pendingMrnForApp || 0, text: (this.mrnData?.pendingMrnForApp || 0).toString(), color: '#527F88' },
      { x: 'Pending Inspection', y: this.mrnData?.pendingMrnForInspection || 0, text: (this.mrnData?.pendingMrnForInspection || 0).toString(), color: '#FFA38F' },
    ];

  }


  getCardsListData(action: string) {
    this.userService.getQuestionPaper(`uspGetERPDashboardDetail|action=${action}`).subscribe((res: any) => {
      console.log("getCardsListData========",res);
      this.modalData = res['table']
      this.openModal(action)
    }, 
    (err: HttpErrorResponse) => {
      if (err.status == 403) {
        this.Customvalidation.loginroute(err.status);
      }
    })
  }

  openModal(action: string) {
    let obj = {
      action: action,
      tbldata: this.modalData,
    }
    // this.dialog.open(ErpModalComponent, {
    //   disableClose: true,
    //   width: '100%',
    //   height: 'auto',
    //   hasBackdrop: true,
    //   data: obj,
    //   enterAnimationDuration: '500ms',
    //   exitAnimationDuration: '500ms',
    // });
  }

  
  showWareHouseData() {
    this.isLoading = true
    this.showWarehouse = true
    setTimeout(() => {
      this.isLoading = false
    }, 2000);
  }


  getPurchaseOrderListData(action:string,header:string){
    let ActionFor=action.toUpperCase()
    console.log("ActionFor=======",ActionFor);
        this.userService.getQuestionPaper(`uspGetDashboardPendingDetail|action=${ActionFor}`).subscribe((res: any) => {
          this.modalData = res['table']
          this.openModal(header)
        }, (err: HttpErrorResponse) => {
          if (err.status == 403) {
            this.Customvalidation.loginroute(err.status);
          }
        })
  }



}
