import { Component, OnInit, ChangeDetectionStrategy, ViewChild, AfterViewInit, TemplateRef, inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { MatTableDataSource, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatNoDataRow } from '@angular/material/table';
import { Fault } from 'src/app/models/fault.model';
import { User } from 'src/app/models/user.model';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { FaultService } from 'src/app/services/facility-management/fault.service';
import { ToastService } from 'src/app/services/toast.service';
import { MatFormField, MatLabel, MatPrefix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatCard, MatCardHeader, MatCardTitle, MatCardContent, MatCardActions } from '@angular/material/card';
import { ViewServiceRequestComponent } from './viewservicerequest/view-service-request.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-service-request',
    templateUrl: './service-request.component.html',
    styleUrls: ['./service-request.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatFormField, MatLabel, MatIcon, MatPrefix, MatInput, MatTable, MatSort, NgFor, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatSortHeader, MatCellDef, MatCell, NgIf, MatIconButton, MatMenuTrigger, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatNoDataRow, MatProgressBar, MatButton, MatPaginator, MatMenu, MatMenuItem, MatCard, MatCardHeader, MatCardTitle, MatCardContent, ViewServiceRequestComponent, MatCardActions, MatProgressSpinner, DatePipe]
})
export class ServiceRequestComponent implements OnInit, AfterViewInit {
  private authenticationService = inject(AuthenticationService);
  private faultService = inject(FaultService);
  private toastService = inject(ToastService);
  private dialog = inject(MatDialog);


  public showPrintDialog = false;
  public loading = false;
  public loadError = '';
  public deletingServiceRequest = false;
  public updatingServiceRequest = false;
  public showdelete = false;
  public serviceRequests: Fault[] = [];
  public selectedServiceRequest: Fault;
  public canCloseTicket = false;
  public showReportFaultDialog = false;
  public currentUser: User;
  public showDialog: boolean;
  public cols = [
    { field: 'createdDate', header: 'Logged Date' },
    { field: 'facilityName', header: 'Facility Name' },
    { field: 'propertyDescription', header: 'Exact Location of Issue' },
    { field: 'incidentDescription', header: 'Description' },
    { field: 'status', header: 'Status' }
  ];

  status: any;
  isSuccessful: boolean;
  displayedColumns = this.cols.map(col => col.field).concat('actions');
  dataSource = new MatTableDataSource<Fault>([]);
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('serviceRequestDialog') serviceRequestDialog: TemplateRef<unknown>;
  @ViewChild('deleteServiceRequestDialog') deleteServiceRequestDialog: TemplateRef<unknown>;
  private serviceRequestDialogRef: MatDialogRef<unknown> | null = null;
  private deleteServiceRequestDialogRef: MatDialogRef<unknown> | null = null;

  ngOnInit() {
    this.authenticationService.currentUser.pipe().subscribe(x => {
      this.currentUser = x;
    });

    this.loadServiceRequests();
  }

  loadServiceRequests() {
    if (this.loading) {
      return;
    }
    this.loading = true;
    this.loadError = '';
    this.faultService.getFaults().subscribe(faults => {
        this.loading = false;
        if (Array.isArray(faults)) {
          faults.forEach(element => {
            switch (element.status) {
              case 'Closed':
                element.statusColor = 'green';
                break;
              case 'New':
                  element.statusColor = 'red';
                  break;
              default:
                element.statusColor = 'orange';
                break;
            }
          });
          this.serviceRequests = faults;
          this.dataSource.data = faults;
        } else {
          this.serviceRequests = [];
          this.dataSource.data = [];
          this.loadError = 'Unable to load service requests. Please try again.';
          this.toastService.showError(this.loadError);
        }
      },
      error => {
        this.loading = false;
        this.serviceRequests = [];
        this.dataSource.data = [];
        this.loadError = 'Unable to load service requests. Please try again.';
        this.toastService.showError(this.toastService.getApiErrorMessage(error));
      });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    if (this.sort) {
      this.sort.active = 'createdDate';
      this.sort.direction = 'desc';
      this.sort.sortChange.emit();
    }
  }

  applyFilter(value: string) {
    this.dataSource.filter = value.trim().toLowerCase();
    this.dataSource.paginator?.firstPage();
  }

  confirmDeleteProject(){
      this.showdelete = true;
      this.deleteServiceRequestDialogRef = this.dialog.open(this.deleteServiceRequestDialog, { width: '460px' });
      this.deleteServiceRequestDialogRef.afterClosed().subscribe(() => {
        this.showdelete = false;
        this.deleteServiceRequestDialogRef = null;
      });
  }

  updateProject(){
    this.showDialog = true;
    this.openServiceRequestDialog();
  }

  closeServiceRequest(e){
    if (e.isChild) {
      this.serviceRequestDialogRef?.close();
    }
  }

  viewServiceRequest(){
    if (this.selectedServiceRequest.status === 'New') {
      if (this.updatingServiceRequest) {
        return;
      }
      const updatedServiceRequest = {
        ...this.selectedServiceRequest,
        status: 'In Progress',
        modifiedDate: new Date()
      };
      this.updatingServiceRequest = true;
      this.faultService.updateFault(updatedServiceRequest).subscribe(isUpdated =>{
        this.updatingServiceRequest = false;
        if (isUpdated) {
          Object.assign(this.selectedServiceRequest, updatedServiceRequest);
          this.selectedServiceRequest.statusColor = 'orange';
          this.showDialog = true;
          this.canCloseTicket = false;
          this.openServiceRequestDialog();
        } else {
          this.toastService.showError('Unable to update this service request. Please try again.');
        }
      }, error => {
        this.updatingServiceRequest = false;
        this.toastService.showError(this.toastService.getApiErrorMessage(error));
      });
    } else {
      this.showDialog = true;
      this.canCloseTicket = false;
      this.openServiceRequestDialog();
    }
  }

  closeTicket(){
    this.showDialog = true;
    this.canCloseTicket = true;
    this.openServiceRequestDialog();
  }

  closeServiceRequestDialog() {
    this.serviceRequestDialogRef?.close();
  }

  closeDeleteServiceRequestDialog() {
    if (!this.deletingServiceRequest) {
      this.deleteServiceRequestDialogRef?.close();
    }
  }

  addProject(){

  }

  selectFacility (selectedServiceRequest: Fault) {   
    this.selectedServiceRequest = selectedServiceRequest;
  }

  onDeleteFault(){
    if (this.deletingServiceRequest || !this.selectedServiceRequest) {
      return;
    }
    this.deletingServiceRequest = true;
    if (this.deleteServiceRequestDialogRef) {
      this.deleteServiceRequestDialogRef.disableClose = true;
    }
    this.faultService.deleteFault(this.selectedServiceRequest).pipe().subscribe(isUpdated => {
      if (isUpdated) {
        this.toastService.showSuccess('Service request deleted successfully.');
        this.serviceRequests = this.serviceRequests.filter(
          request => request !== this.selectedServiceRequest
        );
        this.dataSource.data = this.serviceRequests;
        this.showdelete = false;
        this.deleteServiceRequestDialogRef?.close();
      } else {
        this.toastService.showError('Unable to delete this service request. Please try again.');
        if (this.deleteServiceRequestDialogRef) {
          this.deleteServiceRequestDialogRef.disableClose = false;
        }
      }
      this.deletingServiceRequest = false;
    },
      error => {
        this.deletingServiceRequest = false;
        if (this.deleteServiceRequestDialogRef) {
          this.deleteServiceRequestDialogRef.disableClose = false;
        }
        this.toastService.showError(this.toastService.getApiErrorMessage(error));
      });
  }

  private openServiceRequestDialog() {
    if (this.serviceRequestDialogRef) {
      return;
    }
    this.serviceRequestDialogRef = this.dialog.open(this.serviceRequestDialog);
    this.serviceRequestDialogRef.afterClosed().subscribe(() => {
      this.showDialog = false;
      this.serviceRequestDialogRef = null;
    });
  }

}
