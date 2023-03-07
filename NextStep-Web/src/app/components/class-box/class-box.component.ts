import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-class-box',
  templateUrl: './class-box.component.html',
  styleUrls: ['./class-box.component.css']
})
export class ClassBoxComponent implements OnInit {
  @Input() classData: {
    class: '',
    time: '',
    subject: '',
    semester: '',
    section: '',
    days: any,
    currentClass: boolean
  };
  @Input() classAction: boolean;
  @Output() actionEvent = new EventEmitter<string>();
  shortDays = '';
  category = 'S';
  constructor(public router: Router) { } 
  ngOnInit() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    this.category = userData.category;
    //this.parseDays(this.classData);
  }

  getShortDay(day: string) {
    if(day === 'Monday') { return 'Mon'; }
    if(day === 'Tuesday') { return 'Tue'; }
    if(day === 'Wednesday') { return 'Wed'; }
    if(day === 'Thursday') { return 'Thu'; }
    if(day === 'Friday') { return 'Fri'; }
    if(day === 'Saturday') { return 'Sat'; }
    if(day === 'Sunday') { return 'Sun'; }
  }

  // parseDays(data) {
  //   var temp = [];
  //   for(var i=0; i<data.days.length; i++) {
  //     temp.push(this.getShortDay(data.days[i]));
  //   }
  //   data.days = temp;
  // }

  onClickAction(action: any, data: any) {
    data.actionType = action;
    this.actionEvent.emit(data);
  };

  onClickDetails(item) {
    //this.router.navigate(['/dashboard/' + item.id + '&' + item.start.toISOString().slice(0,10)]);
    this.router.navigate(['/dashboard/' + item.id]);
  }
}
