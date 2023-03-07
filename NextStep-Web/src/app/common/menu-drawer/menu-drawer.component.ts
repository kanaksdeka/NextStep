import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu-drawer',
  templateUrl: './menu-drawer.component.html',
  styleUrls: ['./menu-drawer.component.css']
})
export class MenuDrawerComponent implements OnInit {
  menuList = [];
  constructor(public router: Router) {}

  ngOnInit() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    this.menuList = this.getMenus(userData.category);
  }

  getMenus(category: string) {
    let menu = [];
    if(category === 'A') {
      menu = [
        {name: 'Dashboard', imageName: 'dashboard', route: '/admin-dashboard', displayName: 'Dashboard'},
        {name: 'New User', imageName: 'menu-4', route: '/admin-user', displayName: 'New User'},
        {name: 'Manage Class', imageName: 'menu-2', route: '/admin-class', displayName: 'Manage Class'},
        {name: 'My School At A Glance', imageName: 'menu-7', route: '/admin-glance', displayName: 'My School At A Glance'},
        {name: 'Manage Student', imageName: 'menu-9', route: '/admin-student', displayName: ''},
        {name: 'Search Database', imageName: 'search', route: '/admin-search', displayName: ''},
        //{name: 'Community', imageName: 'menu-6', route: '/admin-community', displayName: ''},
        {name: 'Directory of class', imageName: 'menu-8', route: '/admin-directory', displayName: ''},
        {name: 'Communication', imageName: 'menu-8', route: '/admin-communication', displayName: ''},
        //{name: 'Manage Licences', imageName: 'menu-10', route: '/admin-dashboard', displayName: ''}
      ];
    }
    if(category === 'T') {
      menu = [
        {name: 'Dashboard', imageName: 'dashboard', route: '/dashboard', displayName: 'Dashboard'},
        {name: 'Search Database', imageName: 'search', route: '/search', displayName: ''},
      ];
    }
    if(category === 'S') {
      menu = [
        {name: 'Dashboard', imageName: 'dashboard', route: '/dashboard', displayName: 'Dashboard'},
        {name: 'Search Database', imageName: 'search', route: '/search', displayName: ''},
      ];
    }
    return menu;
  }

  // Click function for specific page
  onGoToPage(nav) {
    console.log('nav', nav.name);
    this.router.navigateByUrl(nav.route);
  }

}
