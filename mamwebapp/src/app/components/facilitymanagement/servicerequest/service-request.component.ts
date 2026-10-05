import { Component, OnInit, ChangeDetectionStrategy, ViewChild, AfterViewInit, TemplateRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Fault } from 'src/app/models/fault.model';
import { Project } from 'src/app/models/project.model';
import { User } from 'src/app/models/user.model';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { FaultService } from 'src/app/services/facility-management/fault.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  standalone: false,
  selector: 'app-service-request',
  templateUrl: './service-request.component.html',
  styleUrls: ['./service-request.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager
})
export class ServiceRequestComponent implements OnInit, AfterViewInit {

  public showPrintDialog = false;
  public loading: boolean = false;
  public loadError = '';
  public deletingServiceRequest = false;
  public updatingServiceRequest = false;
  public showdelete:boolean = false;
  public serviceRequests: Array<Fault> = [];
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

  constructor(
    private authenticationService: AuthenticationService,
    private faultService: FaultService,
    private toastService: ToastService,
    private dialog: MatDialog
  ) { }

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
