import { Component, OnInit, ViewEncapsulation, Inject, ViewChild, TemplateRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { HttpClient } from '@angular/common/http';
import { UrlListService } from '../../../shared/url-list.service';
import { DomSanitizer } from '@angular/platform-browser';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Color, SingleDataSet, MultiDataSet, Label, monkeyPatchChartJsLegend, monkeyPatchChartJsTooltip } from 'ng2-charts';
export interface PeriodicElement {
}

export interface DialogData {
  tempData: any;
  id: string,
  subject: string
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H', marks: '100fsdfd'},
  {position: 2, name: 'Helidsfsdfum', weight: 4.0026, symbol: 'He', marks: '100dfsd'},
  {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li', marks: '100'},
  {position: 4, name: 'Berdsfsdfyllium', weight: 9.0122, symbol: 'Be', marks: '100'},
  {position: 5, name: 'Boron', weight: 10.811, symbol: 'B', marks: '100'},
];

@Component({
  selector: 'app-admin-glance',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './admin-glance.component.html',
  styleUrls: ['./admin-glance.component.css', '../../../common/header/common.css']
})
export class AdminGlanceComponent implements OnInit {
  dashboardGlance: any;
  paramUser = 0;
  loader = false;
  subjectList = [];
  subjectList2 = [];
  sectionList = [];
  gradeList = [];
  semesterList = [];
  classData = { semester: '', section: '', class: ''};
  selectedTab = 'students';

  displayedColumns: string[] = ['semester', 'grade', 'section', 'name'];
  displayedColumns2: string[] = ['name', 'weight'];
  dataSource = new MatTableDataSource<PeriodicElement>(this.subjectList);
  dataSource2 = ELEMENT_DATA;

  public lineChartData: ChartDataSets[] = [
    { data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A' },
  ];
  public lineChartLabels: Label[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  public lineChartOptions: ChartOptions  = {
    responsive: true,
  };
  public lineChartColors: Color[] = [
    {
      borderColor: 'black',
      backgroundColor: 'rgba(255,0,0,0.3)',
    },
  ];
  public lineChartLegend = false;
  public lineChartType = 'line';
  public lineChartPlugins = [];

  public barChartOptions: ChartOptions = {
    responsive: true,
  };
  public barChartLabels: Label[] = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
  public barChartType: ChartType = 'bar';
  public barChartLegend = false;
  public barChartPlugins = [];

  public barChartData: ChartDataSets[] = [
    { data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A' },
    { data: [28, 48, 40, 19, 86, 27, 90], label: 'Series B' }
  ];

  // Pie
  public pieChartOptions: ChartOptions = {
    responsive: true,
  };
  public pieChartLabels: Label[] = [['Download', 'Sales'], ['In', 'Store', 'Sales'], 'Mail Sales'];
  public pieChartData: SingleDataSet = [300, 500, 100];
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = false;
  public pieChartPlugins = [];


  // Doughnut
  public doughnutChartLabels: Label[] = ['Download Sales', 'In-Store Sales', 'Mail-Order Sales'];
  public doughnutChartData: MultiDataSet = [
    [350, 450, 100],
    [50, 150, 120],
    [250, 130, 70],
  ];
  public doughnutChartType: ChartType = 'doughnut';
  
  constructor(public router: Router, public dialog: MatDialog, private http: HttpClient, private urlListService: UrlListService, private sanitizer: DomSanitizer, private activatedRoute: ActivatedRoute,  private _snackBar: MatSnackBar) {
    monkeyPatchChartJsTooltip();
    monkeyPatchChartJsLegend();
   }
  ngOnInit() {
    this.getAllRecords();
    this.activatedRoute.params.subscribe(paramsId => {
      if(paramsId.user !== undefined) { 
        this.paramUser = paramsId.user;
      }
    });
    this.dashboardGlance = this.sanitizer.bypassSecurityTrustResourceUrl(this.urlListService.urls.dashboardGlance);
  }
  onCancelClick() {
    if(this.paramUser === 0) {
      this.router.navigate(['/admin-dashboard']);
    } else {
      this.router.navigate(['/u/' + this.paramUser + '/admin-dashboard']);
    }
  }
  getAllRecords() {
    let response: any, responsesection: any, responsegrade: any;
    this.loader = true;

    this.http.get(this.urlListService.urls.getAllStudent)
      .subscribe(event => {
        response = event;
        if (response && response.length > 0) {
          for (var i = 0; i < 5; i++) {
            response[i].name = response[i].profile.fullname;
            response[i].semester_name = response[i].profile.class[0].semester_name;
            response[i].class_name = response[i].profile.class[0].class_name;
            response[i].section_name = response[i].profile.class[0].section_name;
          }
          this.subjectList = response.slice(0,5);
          this.dataSource = new MatTableDataSource<PeriodicElement>(this.subjectList);
        }
      });
    this.http.get(this.urlListService.urls.semesterFetch)
      .subscribe(event => {
        response = event;
        if (response && response.length > 0) {
          this.semesterList = response;
          this.loader = false;
        } else {
          this._snackBar.open('Please create semeters first and then try addign new class !', '', {
            duration: 6000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: 'error-message'
          });
          this.loader = false;
        }
      })
    this.http.get(this.urlListService.urls.subjectAll)
      .subscribe(event => {
        response = event;
        if (response && response.length > 0) {
          this.subjectList = response;
          this.loader = false;
        } else {
          this._snackBar.open('Please create subjects first and then try addign new class !', '', {
            duration: 6000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: 'error-message'
          });
          this.loader = false;
        }
      })
    this.http.get(this.urlListService.urls.sectionAll)
      .subscribe(event => {
        responsesection = event;
        if (responsesection && responsesection.length > 0) {
          this.sectionList = responsesection;
          this.loader = false;
        } else {
          this._snackBar.open('Please create sections first and then try addign new class !', '', {
            duration: 6000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: 'error-message'
          });
          this.loader = false;
        }
      })
    this.http.get(this.urlListService.urls.gradeAll)
      .subscribe(event => {
        responsegrade = event;
        if (responsegrade && responsegrade.length > 0) {
          this.gradeList = responsegrade;
          this.loader = false;
        } else {
          this._snackBar.open('Please create grades first and then try addign new class !', '', {
            duration: 6000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: 'error-message'
          });
          this.loader = false;
        }
      })
  }
  
  onValChange(type: string) {
   this.selectedTab = type;
  }
}