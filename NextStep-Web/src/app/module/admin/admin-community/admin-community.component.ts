import { Component, OnInit, ViewChild, ViewEncapsulation, ElementRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgForm } from '@angular/forms';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { AdminClassAddComponent } from '../admin-class/admin-class-add/admin-class-add.component';
import { HttpClientModule, HttpClient, HttpRequest, HttpResponse, HttpEventType } from '@angular/common/http';
import { ChartType, ChartOptions, ChartDataSets } from 'chart.js';
import { SingleDataSet, Label, MultiDataSet, monkeyPatchChartJsLegend, monkeyPatchChartJsTooltip } from 'ng2-charts';
import { UrlListService } from '../../../shared/url-list.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
export interface PeriodicElement {
}

@Component({
  selector: 'app-admin-community',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './admin-community.component.html',
  styleUrls: ['./admin-community.component.css', '../../../common/header/common.css']
})
export class AdminCommunityComponent implements OnInit {
  // subjectList = [
  //   { date: 'Jul 16 2020', mainteacherindex: 'Teacher 1', class: 'V', section: 'Sec A', subject: 'link', days: 'link', startdate: '70', enddate: '40', time: 'Complete' },
  //   { date: 'Jul 16 2020', mainteacherindex: 'Teacher 1', class: 'V', section: 'Sec A', subject: 'link', days: 'link', startdate: '70', enddate: '80', time: 'In Progress' },
  //   { date: 'Jul 16 2020', mainteacherindex: 'Teacher 1', class: 'V', section: 'Sec A', subject: 'link', days: 'link', startdate: '70', enddate: '70', time: 'Complete' },
  //   { date: 'Jul 16 2020', mainteacherindex: 'Teacher 1', class: 'V', section: 'Sec A', subject: 'link', days: 'link', startdate: '70', enddate: '50', time: 'Yet to Start' },
  //   { date: 'Jul 16 2020', mainteacherindex: 'Teacher 1', class: 'V', section: 'Sec A', subject: 'link', days: 'link', startdate: '70', enddate: '40', time: 'Complete' }
  // ];

  // displayedColumns: string[] = ['date', 'mainteacherindex', 'class', 'section', 'subject', 'days', 'startdate', 'enddate', 'time'];
  // dataSource = new MatTableDataSource<PeriodicElement>(this.subjectList);
  // @ViewChild(MatPaginator, { read: '', static: true }) paginator: MatPaginator;
  // @ViewChild(MatSort, { read: '', static: true }) sort: MatSort;

  /*********************************Chart code start *****************************************/
  // public pieChartOptions: ChartOptions = {
  //   responsive: true,
  // };
  // public pieChartLabels: Label[] = [['Download', 'Sales'], ['In', 'Store', 'Sales'], 'Mail Sales'];
  // public pieChartData: SingleDataSet = [300, 500, 100];
  // public pieChartType: ChartType = 'pie';
  // public pieChartLegend = true;
  // public pieChartPlugins = [];

  // public barChartOptions: ChartOptions = {
  //   responsive: true,
  // };
  // public barChartLabels: Label[] = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
  // public barChartType: ChartType = 'bar';
  // public barChartLegend = true;
  // public barChartPlugins = [];

  // public barChartData: ChartDataSets[] = [
  //   { data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A' },
  //   { data: [28, 48, 40, 19, 86, 27, 90], label: 'Series B' }
  // ];

  // public doughnutChartLabels: Label[] = ['Download Sales', 'In-Store Sales', 'Mail-Order Sales'];
  // public doughnutChartData: MultiDataSet = [
  //   [350, 450, 100],
  //   [50, 150, 120],
  //   [250, 130, 70],
  // ];
  // public doughnutChartType: ChartType = 'doughnut';

  /*********************************Chart code end *****************************************/
  dashboardGlance: any;
  constructor(public router: Router, public dialog: MatDialog, private http: HttpClient, private urlListService: UrlListService, private sanitizer: DomSanitizer) { }
  ngOnInit() {
    //this.dataSource = new MatTableDataSource<PeriodicElement>(this.subjectList);
    //this.dataSource.paginator = this.paginator;
    this.dashboardGlance = this.sanitizer.bypassSecurityTrustResourceUrl(this.urlListService.urls.dashboardCommunity);
  }

  // getAllRecords() {
  //   let response: any;
  //   this.http.get(this.urlListService.urls.classAll)
  //     .subscribe(event => {
  //       response = event;
  //     })
  // }

  // onAddEditRecord(type: string, data: any): void {
  //   if (type === 'edit') {
  //     data.teacherid = data.mainteacherindex;
  //     data.dateFrom = data.startdate.split('T')[0];
  //     data.dateTo = data.enddate.split('T')[0];
  //     data.from = data.starttime;
  //     data.to = data.endtime;
  //   }
  //   const dialogProjectRef = this.dialog.open(AdminClassAddComponent, {
  //     disableClose: true,
  //     panelClass: 'create-new-class',
  //     width: '550px',
  //     data: { 'cData': data }
  //   });

  //   dialogProjectRef.afterClosed().subscribe(result => {
  //     if (result === 'yes') {
  //       this.getAllRecords();
  //     }
  //   });
  // }

  onCancelClick() {
    this.router.navigate(['/admin-dashboard']);
  }

  // goToRoute(item: string) {
  //   if (item === 'subject') {
  //     this.router.navigate(['/admin-subject']);
  //   }
  //   if (item === 'grade') {
  //     this.router.navigate(['/admin-grade']);
  //   }
  //   if (item === 'section') {
  //     this.router.navigate(['/admin-section']);
  //   }
  // }

}
