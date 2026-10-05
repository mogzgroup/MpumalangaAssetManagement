import { DatePipe } from '@angular/common';
import { Component, ElementRef, Input, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { first } from 'rxjs/operators';
import { LeasedProperty } from 'src/app/models/leased-property.model';
import { User } from 'src/app/models/user.model';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { FaultService } from 'src/app/services/facility-management/fault.service';
import { LeasedPropertiesService } from 'src/app/services/leased-property/leased-property.service';
import { SharedService } from 'src/app/services/shared.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  standalone: false,
  selector: 'app-facility-management',
  templateUrl: './facility-management.component.html',
  styleUrls: ['./facility-management.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager
})
export class FacilityManagementComponent implements OnInit {

  public newCount: number = 0;
  public inProgressCount: number = 0;
  public completedCount: number = 0;
  public total: number = 0;
  constructor(private faultService: FaultService, private toastService: ToastService) {
  
  }

  ngOnInit() {
    this.newCount = 0;
    this.inProgressCount = 0;
    this.completedCount = 0;
    this.total = 0;

    this.faultService.getFaults().subscribe(faults => {
      if (faults) {
        this.total = faults.length;
        faults.forEach(element => {
          switch (element.status) {
            case 'Closed':
              element.statusColor = 'green';
              this.completedCount = this.completedCount + 1;
              break;
            case 'New':
                element.statusColor = 'red';
                this.newCount = this.newCount + 1;
                break;
            default:
              element.statusColor = 'orange';
              this.inProgressCount = this.inProgressCount + 1;
              break;
          }
        });
        
      }
    },
    error => {
      this.toastService.showError(this.toastService.getApiErrorMessage(error));
    });
  }
}
