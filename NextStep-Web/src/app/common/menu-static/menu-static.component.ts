import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-menu-static',
  templateUrl: './menu-static.component.html',
  styleUrls: ['./menu-static.component.css']
})
export class MenuStaticComponent implements OnInit {
  menuList = [];
  constructor() { }

  ngOnInit() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    this.menuList = this.getMenus(userData.category);
  }

  getMenus(category: string) {
    let menu = [];
    if(category === 'A') {
      menu = [
        {name: 'Dashboard', imageName: 'dashboard', route: '/admin-dashboard', displayName: 'Dashboard'},
        {name: 'New User', imageName: 'user', route: '/admin-user', displayName: 'New User'},
        {name: 'Manage Class', imageName: 'manageclass', route: '/admin-class', displayName: 'Manage Class'},
        {name: 'My School At A Glance', imageName: 'myschoolatglance', route: '/admin-glance', displayName: 'My School At A Glance'},
        {name: 'Manage Student', imageName: 'managestudent', route: '/admin-student', displayName: ''},
        {name: 'Search Database', imageName: 'search', route: '/admin-search', displayName: ''},
        //{name: 'Community', imageName: 'community', route: '/admin-community', displayName: ''},
        {name: 'Directory of class', imageName: 'managedirectory', route: '/admin-directory', displayName: ''},
        {name: 'Communication', imageName: 'communication', route: '/admin-communication', displayName: ''},
        //{name: 'Manage Licences', imageName: 'managelicences', route: '/admin-dashboard1', displayName: ''}
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

}
