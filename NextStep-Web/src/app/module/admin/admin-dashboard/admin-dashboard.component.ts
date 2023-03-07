import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AdminClassAddComponent } from '../admin-class/admin-class-add/admin-class-add.component'
import { UrlListService } from '../../../shared/url-list.service';
@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css', '../../../common/header/common.css']
})
export class AdminDashboardComponent implements OnInit {
  paramUser = 0;
  constructor(private route: ActivatedRoute, public router: Router, public dialog: MatDialog, private urlListService: UrlListService, private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    const tempUserData = JSON.parse(localStorage.getItem('userData'));
    this.activatedRoute.params.subscribe(paramsId => {
      if(paramsId.user !== undefined) {
        this.paramUser = paramsId.user;
        this.reload();
      }
    });
  }

  reload() {
    if (!localStorage.getItem('x-admin-fkp')) {
      localStorage.setItem('x-admin-fkp', 'no reload')
      document.defaultView.location.reload();
    } else {
      localStorage.removeItem('x-admin-fkp')
    }
  }

  groupList = [
    {displayName: 'New User', imageName: 'user_white', subTitle: 'Total user 10,200', targetReached: '48%'},
    {displayName: 'Manage Class', imageName: 'manageClass_white', subTitle: 'Active class 48', targetReached: '48%'},
    {displayName: 'My School At A Glance', imageName: 'glance_white', subTitle: 'Attendance 96%', targetReached: '48%'},
    {displayName: 'Manage Student', imageName: 'manageStudent_white', subTitle: '', targetReached: ''},
    {displayName: 'Search Database', imageName: 'search_white', subTitle: 'Search Result 10,200', targetReached: '48%'},
    // {displayName: 'Community', imageName: 'community_white', subTitle: 'Categories 15', targetReached: '48%'},
    {displayName: 'Directory of Class', imageName: 'managedirectory', subTitle: 'Lorem ipsum', targetReached: '48%'},
    // {displayName: 'Manage Licences', imageName: 'manageLicences_white', subTitle: 'Lorem ipsum', targetReached: '48%'},
    {displayName: 'Communication', imageName: 'communication_white', subTitle: 'Lorem ipsum', targetReached: '48%'},

  ];

  onGoToPage(item: { displayName: string; }) {
    if(this.paramUser === 0) {
      if(item.displayName === 'New User') {
        this.router.navigate(['/admin-user']);
      }
      if(item.displayName === 'Manage Class') {
        this.router.navigate(['/admin-class']);
      }
      if(item.displayName === 'My School At A Glance') {
        this.router.navigate(['/admin-glance']);
      }
      if(item.displayName === 'Manage Student') {
        this.router.navigate(['/admin-student']);
      }
      if(item.displayName === 'Search Database') {
        this.router.navigate(['/admin-search']);
      }
      if(item.displayName === 'Communication') {
        this.router.navigate(['/admin-communication']);
      }
      if(item.displayName === 'Directory of Class') {
        this.router.navigate(['/admin-directory']);
      }
      if(item.displayName === 'Community') {
        //this.router.navigate(['/admin-community']);
        window.open(this.urlListService.urls.dashboardCommunity);
      }
    } else {
      if(item.displayName === 'New User') {
        this.router.navigate(['/u/' + this.paramUser + '/admin-user']);
      }
      if(item.displayName === 'Manage Class') {
        this.router.navigate(['/u/' + this.paramUser + '/admin-class']);
      }
      if(item.displayName === 'My School At A Glance') {
        this.router.navigate(['/u/' + this.paramUser + '/admin-glance']);
      }
      if(item.displayName === 'Manage Student') {
        this.router.navigate(['/u/' + this.paramUser + '/admin-student']);
      }
      if(item.displayName === 'Search Database') {
        this.router.navigate(['/u/' + this.paramUser + '/admin-search']);
      }
      if(item.displayName === 'Communication') {
        this.router.navigate(['/u/' + this.paramUser + '/admin-communication']);
      }
      if(item.displayName === 'Directory of Class') {
        this.router.navigate(['/u/' + this.paramUser + '/admin-directory']);
      }
      if(item.displayName === 'Community') {
        //this.router.navigate(['/admin-community']);
        window.open(this.urlListService.urls.dashboardCommunity);
      }
    }

  }

  onCreateNewClass(): void {
    const dialogProjectRef = this.dialog.open(AdminClassAddComponent, {
      disableClose: true,
      panelClass: 'create-new-class',
      width: '550px',
      data: {'cData': ''}
    });

    dialogProjectRef.afterClosed().subscribe(result => {
      if(result !== undefined) {
        console.log('The dialog was closed', result);
        // this.classList.push({
        //   id: '124',
        //   class: result.class + ' ' + result.section,
        //   days: result.days,
        //   time: result.from + ' - ' + result.to,
        //   subject: result.subject,
        //   dateFrom: result.dateFrom,
        //   dateTo: result.dateTo,
        //   from: result.from,
        //   to: result.to,
        //   data: result
        // });
        // this.updateEventList(result);
      }
    });
  }

}
