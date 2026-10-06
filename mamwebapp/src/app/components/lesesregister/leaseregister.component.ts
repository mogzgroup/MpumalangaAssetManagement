import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { LeaseManagementComponent } from '../leasemanagement/lease-management.component';
import { HiringComponent } from '../hiring/hiring.component';

@Component({
    selector: 'app-leaseregister',
    templateUrl: './leaseregister.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./leaseregister.component.css'],
    imports: [MatTabGroup, MatTab, LeaseManagementComponent, HiringComponent]
})
export class LeaseRegisterComponent implements OnInit {
  constructor() { }

  ngOnInit() {
  }

}
