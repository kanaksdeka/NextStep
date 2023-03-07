import { Component } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  template: '<div class="lds-ring"><div></div><div></div><div></div><div></div></div>',
  //template: '<mat-progress-bar class="loading-spinner" mode="indeterminate" value="40"></mat-progress-bar>',
  styleUrls: ['./loading-spinner.component.css']
})
export class LoadingSpinnerComponent {}
