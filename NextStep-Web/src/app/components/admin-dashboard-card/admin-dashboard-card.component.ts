import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";


@Component({
  selector: 'admin-dashboard-card',
  templateUrl: './admin-dashboard-card.component.html',
  styleUrls: ['./admin-dashboard-card.component.css']
})
export class AdminDashboardCardComponent implements OnInit {
  @Input() cardData: {
    displayName: '',
    imageName: '',
    subTitle: '',
    targetReached: '',
  };

  @Output() actionEvent = new EventEmitter<object>();

  public iconLabel: string;
  constructor(private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer) { }

  ngOnInit() {
    const svgPath = `assets/new/${this.cardData.imageName}.svg`;
    this.iconLabel = `dashboardCard${this.cardData.imageName}`;
    this.matIconRegistry.addSvgIcon(this.iconLabel, this.domSanitizer.bypassSecurityTrustResourceUrl(svgPath));
  }

  onCardClick(data) {
    this.actionEvent.emit(data);
  }
}
