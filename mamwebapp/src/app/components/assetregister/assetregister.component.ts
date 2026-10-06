import { Component, OnInit, Input, ViewChild, AfterViewInit, ChangeDetectionStrategy, TemplateRef, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { MatTableDataSource, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatNoDataRow } from '@angular/material/table';
import { first } from 'rxjs/operators';
import { FacilityService } from '../../services/facility/facility.service';
import { AuthenticationService } from '../../services/authentication.service';
import { Facility } from 'src/app/models/facility.model';
import { User } from 'src/app/models/user.model';
import { ToastService } from '../../services/toast.service';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle, MatCardActions } from '@angular/material/card';
import { DatePipe } from '@angular/common';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel, MatPrefix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatTooltip } from '@angular/material/tooltip';
import { MatMenuTrigger, MatMenu, MatMenuContent, MatMenuItem } from '@angular/material/menu';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { AddassetregisterComponent } from './addassetregister/addassetregister.component';
import { PrintAssetComponent } from './print-asset/print-asset.component';
import { ConditionAssessmentComponent } from './conditionassessment/condition-assessment.component';

@Component({
    selector: 'app-assetregister',
    templateUrl: './assetregister.component.html',
    styleUrls: ['./assetregister.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatCard, MatCardContent, MatButton, MatIcon, MatFormField, MatLabel, MatPrefix, MatInput, MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatSortHeader, MatCellDef, MatCell, MatIconButton, MatTooltip, MatMenuTrigger, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatNoDataRow, MatProgressSpinner, MatPaginator, MatMenu, MatMenuContent, MatMenuItem, MatCardHeader, MatCardTitle, AddassetregisterComponent, PrintAssetComponent, MatCardActions, ConditionAssessmentComponent, DatePipe]
})
export class AssetregisterComponent implements OnInit, AfterViewInit {
  private authenticationService = inject(AuthenticationService);
  facilityService = inject(FacilityService);
  private toastService = inject(ToastService);
  private dialog = inject(MatDialog);

  loading = true;
  showPrintDialog= false;
  dialogHeader = '';  
  printDialogHeader = '';
  showdelete = false;
  @Input() selectedAsset: any
  facility: Facility;
  newCaptured = 0;
  awaitingAppoval = 0;
  awaitingVerification = 0;
  deleting = false;
  showDialog = false;
  showConditionAssessment = false;
  mode = 'Add'; 
  error = '';
  cols = [
    { field: 'fileReference', header: 'File Reference' },
    { field: 'name', header: 'Facility Name' },
    { field: 'type', header: 'Type' },
    { field: 'clientCode', header: 'Property Code' },
    { field: 'status', header: 'Status' }
  ];
  facilities = [];
  dataSource = new MatTableDataSource<Facility>([]);
  displayedColumns = this.cols.map(col => col.field).concat('actions');
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('assetDialog') assetDialog: TemplateRef<unknown>;
  @ViewChild('printDialog') printDialog: TemplateRef<unknown>;
  @ViewChild('deleteDialog') deleteDialog: TemplateRef<unknown>;
  @ViewChild('conditionAssessmentDialog') conditionAssessmentDialog: TemplateRef<unknown>;
  private assetDialogRef: MatDialogRef<unknown> | null = null;
  private printDialogRef: MatDialogRef<unknown> | null = null;
  private deleteDialogRef: MatDialogRef<unknown> | null = null;
  private conditionAssessmentDialogRef: MatDialogRef<unknown> | null = null;
  landTotal = 0;
  buildingTotal = 0;
  nonResidentialBuildingTotal = 0;
  currentUser: User;

  ngOnInit() {
    this.authenticationService.currentUser.pipe().subscribe(x => {
      this.currentUser = x;
    });
    this.dataSource.filterPredicate = (facility, filter) => this.cols.some(col =>
      String(facility[col.field] ?? '').toLowerCase().includes(filter)
    );
    this.dataSource.sortingDataAccessor = (facility, property) => {
      const value = facility[property];
      return typeof value === 'string' ? value.toLowerCase() : value ?? '';
    };
    this.loadFacilities();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(value: string) {
    this.dataSource.filter = (value ?? '').trim().toLowerCase();
    this.dataSource.paginator?.firstPage();
  }

  private loadFacilities(): void {
    this.loading = true;
    this.error = '';
    this.facilityService.getAssetRegisterfacilities().pipe(first()).subscribe({
      next: facilities => {
        this.facilities = facilities ?? [];
        this.dataSource.data = [...this.facilities];
        this.updateAssetTotals();
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.facilities = [];
        this.dataSource.data = [];
        this.updateAssetTotals();
        this.error = this.getErrorMessage(error, 'load');
        this.loading = false;
        this.toastService.showError(this.toastService.getApiErrorMessage(error));
      }
    });
  }

  retryLoadFacilities(): void {
    if (!this.loading) {
      this.loadFacilities();
    }
  }

  addFacility(){
    this.dialogHeader = 'Add New Asset';
    this.selectedAsset = {
      mode : 'Add',
      facilityId: undefined,
      facilityType: undefined
    };
    this.showDialog = true;
    this.openAssetDialog();
  }  

  update(facility: Facility = this.facility) {
    this.showDialog = false;
    if(facility != undefined){
      this.facility = facility;
      this.dialogHeader = facility.type + ' ' + facility.clientCode;
      this.selectedAsset = {
        mode : 'Edit',
        facilityId: facility.id,
        facilityType: facility.type,
        facility
      };
      this.showDialog = true;
      this.openAssetDialog();
    }    
  }

  print(facility: Facility = this.facility) {
    this.showPrintDialog = false;
    if(facility != undefined){
      this.facility = facility;
      this.printDialogHeader = facility.type + ' ' + facility.clientCode;
      this.selectedAsset = facility
      this.showPrintDialog = true;
      this.printDialogRef = this.dialog.open(this.printDialog);
      this.printDialogRef.afterClosed().subscribe(() => {
        this.showPrintDialog = false;
        this.printDialogRef = null;
      });
    }    
  }

  viewFacility(facility: Facility = this.facility){
    this.showDialog = false;
    if(facility != undefined){
      this.facility = facility;
      this.dialogHeader = facility.type + ' ' + facility.clientCode;
      this.selectedAsset = {
        mode : 'View',
        facilityId: facility.id,
        facilityType: facility.type,
        facility
      };
      this.showDialog = true;
      this.openAssetDialog();
    }   
  }

  confirmDelete(facility: Facility = this.facility) {
    this.facility = facility;
    this.showdelete = true;
    this.deleteDialogRef = this.dialog.open(this.deleteDialog, { width: '460px' });
    this.deleteDialogRef.afterClosed().subscribe(() => {
      this.showdelete = false;
      this.deleteDialogRef = null;
    });
  }

  deleteFacility(){
    if (!this.facility || this.deleting) {
      return;
    }
    const facility = this.facility;
    this.deleting = true;
    if (this.deleteDialogRef) {
      this.deleteDialogRef.disableClose = true;
    }
    this.facilityService.deleteFacility(facility.id).pipe(first()).subscribe({
      next: isDeleted => {
        this.deleting = false;
        if (!isDeleted) {
          if (this.deleteDialogRef) {
            this.deleteDialogRef.disableClose = false;
          }
          this.toastService.showError('The asset could not be deleted. Please try again.');
          return;
        }
        this.facilities = this.facilities.filter(item => item.id !== facility.id);
        this.dataSource.data = [...this.facilities];
        this.keepPaginatorOnValidPage();
        this.updateAssetTotals();
        this.showdelete = false;
        this.deleteDialogRef?.close();
        this.toastService.showSuccess('Asset deleted successfully.');
      },
      error: (error: HttpErrorResponse) => {
        this.deleting = false;
        if (this.deleteDialogRef) {
          this.deleteDialogRef.disableClose = false;
        }
        this.toastService.showError(this.toastService.getApiErrorMessage(error));
      }
    });
  }

  selectFacility(facility){
    this.facility = facility;
  }

  addUpdateAsset(e){
    if(e?.response === "isAddedSuccessful" && e.data){
      this.showDialog = false;
      this.assetDialogRef?.close();
      const exists = this.facilities.some(facility => facility.id === e.data?.id);
      if (!exists) {
        this.facilities = [...this.facilities, e.data];
      }
      this.dataSource.data = [...this.facilities];
      this.updateAssetTotals();
    }else if(e?.response === "isUpdatedSuccessful" && e.data){
      this.showDialog = false;
      this.assetDialogRef?.close();
      this.facilities = this.facilities.map(facility =>
        facility.id === e.data?.id ? e.data : facility
      );
      this.dataSource.data = [...this.facilities];
      this.updateAssetTotals();
    }
  } 

  conditionAssessment(facility: Facility = this.facility){
    this.facility = facility;
    this.showConditionAssessment = true;
    this.selectedAsset = facility;
    this.conditionAssessmentDialogRef = this.dialog.open(this.conditionAssessmentDialog);
    this.conditionAssessmentDialogRef.afterClosed().subscribe(() => {
      this.showConditionAssessment = false;
      this.conditionAssessmentDialogRef = null;
    });
  }

  closeConditionAssessment(e){
    if(e.isChild)
      this.conditionAssessmentDialogRef?.close();
  }

  closeAssetDialog() {
    this.assetDialogRef?.close();
  }

  closePrintDialog() {
    this.printDialogRef?.close();
  }

  closeDeleteDialog() {
    if (!this.deleting) {
      this.deleteDialogRef?.close();
    }
  }

  closeConditionAssessmentDialog() {
    this.conditionAssessmentDialogRef?.close();
  }

  private openAssetDialog() {
    this.assetDialogRef = this.dialog.open(this.assetDialog, {
      width: 'min(1400px, calc(100vw - 40px))',
      maxWidth: 'calc(100vw - 24px)',
      maxHeight: 'calc(100dvh - 24px)',
      panelClass: 'asset-register-editor-dialog'
    });
    this.assetDialogRef.afterClosed().subscribe(() => {
      this.showDialog = false;
      this.assetDialogRef = null;
    });
  }

  private updateAssetTotals(): void {
    this.landTotal = this.facilities.filter(facility => facility.type === 'Land').length;
    this.buildingTotal = this.facilities.filter(facility => facility.type !== 'Dwelling').length;
    this.nonResidentialBuildingTotal = this.facilities.filter(facility => facility.type !== 'Non Residential').length;
  }

  private keepPaginatorOnValidPage(): void {
    const paginator = this.dataSource.paginator;
    if (!paginator) {
      return;
    }
    const lastPageIndex = Math.max(0, Math.ceil(this.dataSource.filteredData.length / paginator.pageSize) - 1);
    paginator.pageIndex = Math.min(paginator.pageIndex, lastPageIndex);
  }

  private getErrorMessage(error: HttpErrorResponse, operation: 'load' | 'delete'): string {
    if (operation === 'load') {
      return error.status === 401 || error.status === 403
        ? 'You are not authorized to view the asset register.'
        : 'Unable to load assets. Please try again.';
    }
    switch (error.status) {
      case 0:
        return 'Unable to reach the server. Check your connection and try again.';
      case 401:
      case 403:
        return 'You are not authorized to delete assets.';
      case 404:
        return 'This asset could not be found. Refresh the list and try again.';
      default:
        return error.status >= 500
          ? 'The server could not delete this asset. Please try again later.'
          : 'The asset could not be deleted. Please try again.';
    }
  }

}
