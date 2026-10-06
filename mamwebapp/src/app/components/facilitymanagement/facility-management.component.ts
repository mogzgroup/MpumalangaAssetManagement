import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { FaultService } from 'src/app/services/facility-management/fault.service';
import { ToastService } from 'src/app/services/toast.service';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { ServiceRequestComponent } from './servicerequest/service-request.component';
import { ProjectComponent } from './project/project.component';

@Component({
    selector: 'app-facility-management',
    templateUrl: './facility-management.component.html',
    styleUrls: ['./facility-management.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatCard, MatCardContent, MatTabGroup, MatTab, ServiceRequestComponent, ProjectComponent]
})
export class FacilityManagementComponent implements OnInit {
  private faultService = inject(FaultService);
  private toastService = inject(ToastService);


  public newCount = 0;
  public inProgressCount = 0;
  public completedCount = 0;
  public total = 0;

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
