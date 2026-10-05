import { Component, OnInit, ChangeDetectionStrategy, ViewChild, AfterViewInit, TemplateRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { ToastService } from 'src/app/services/toast.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { UampService } from 'src/app/services/uamp/uamp.service';
import { OperationPlan } from 'src/app/models/operation-plan.model';
import { UAMP } from 'src/app/models/uamp.model';
import { SharedService } from 'src/app/services/shared.service';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';

@Component({
  standalone: false,
  selector: 'app-template-five-three',
  templateUrl: './template-five-three.component.html',
  styleUrls: ['./template-five-three.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager
})
export class TemplateFiveThreeComponent implements OnInit, AfterViewInit {
  operationPlans: Array<OperationPlan> = [];
  dataSource = new MatTableDataSource<OperationPlan>([]);
  displayedColumns = [
    'district', 'town', 'municipality', 'assetDescription', 'streetDescription',
    'propertyDescription', 'leaseType', 'parkingBays', 'usableSpace',
    'constructionArea', 'extent', 'leaseStartDate', 'leaseEndDate', 'rental',
    'comment', 'leased'
  ];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('leaseConfirmationDialog') private leaseConfirmationTemplate: TemplateRef<unknown>;
  private confirmationDialogRef: MatDialogRef<unknown> | null = null;
  showLeaseConfirmation = false;
  private pendingLeasePlan: OperationPlan;
  leaseTypes: any[];
  prioities: any[];
  uamp: UAMP;
  isLoading: boolean = false;
  
  constructor(
    private router: Router,
    private sharedService: SharedService,
    private uampService: UampService,
    private toastService: ToastService,
    private dialog: MatDialog
  ) {
    this.uampService.uampChange.subscribe((value) => {
      if(value)
      {
        this.uamp = value;
      }    

      this.operationPlans = [];
      this.uamp.templeteFivePointThree.operationPlans.forEach(element => {          
        element.leaseStartDate = element.leaseStartDate != null ? new Date(element.leaseStartDate) : undefined;
        element.leaseEndDate = element.leaseEndDate != null ? new Date(element.leaseEndDate): undefined;
        this.operationPlans.push(element);          
      });
      this.dataSource.data = this.operationPlans;
    });
  }

  ngOnInit() {
    this.assginData();
    this.prioities = this.sharedService.getPrioities();

    this.leaseTypes = this.sharedService.getLeaseTypes();
  }

  assginData(){
    this.uamp = this.uampService.uamp;
    if(!this.uamp)
      this.router.navigate(['uamp']);
      
    this.operationPlans = this.uamp.templeteFivePointThree.operationPlans;
    this.dataSource.data = this.operationPlans;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  } 

  onLeased(operationPlan: OperationPlan, checked: boolean) {
    if (checked) {
      operationPlan.leased = false;
      this.pendingLeasePlan = operationPlan;
      this.showLeaseConfirmation = true;
      const dialogRef = this.dialog.open(this.leaseConfirmationTemplate, {
        width: '460px',
        maxWidth: '95vw'
      });
      this.confirmationDialogRef = dialogRef;
      dialogRef.afterClosed().subscribe(() => {
        if (this.confirmationDialogRef === dialogRef) {
          this.confirmationDialogRef = null;
          this.showLeaseConfirmation = false;
          this.pendingLeasePlan = undefined;
        }
      });
    } else {
      operationPlan.leased = false;
    }
  }

  confirmLeased(confirmed: boolean) {
    if (this.pendingLeasePlan) {
      this.pendingLeasePlan.leased = confirmed;
    }
    this.closeLeaseConfirmation();
    this.pendingLeasePlan = undefined;
    this.showLeaseConfirmation = false;
  }

  private closeLeaseConfirmation() {
    this.confirmationDialogRef?.close();
    this.confirmationDialogRef = null;
    this.showLeaseConfirmation = false;
  }

  onLeaseTypeChange(operationPlan: OperationPlan, e) {
    if (operationPlan) {
      operationPlan.leaseType = e.value && e.value.name ? e.value.name : e.value;
    }
  }

  nextPage(){
    this.getDataForNextTemplate();
  }

  getDataForNextTemplate() {
    this.isLoading = true;
    this.uampService.getuamptemplate(this.uamp.id, 6).subscribe(
      (templeteSix) => {
        this.uamp.templeteSix = templeteSix;          
        this.uampService.assignUamp(this.uamp);
        this.isLoading = false;
        this.router.navigate(['uampDetails/uampTemp6']);
      },
      (error) => {
        this.toastService.showError(this.toastService.getApiErrorMessage(error));
        this.isLoading = false;
      }
    );
  }

  back(){
    this.router.navigate(['uampDetails/uampTemp52']);
  }

  save() {
    this.uamp.status = "Saved";
    this.uampService.saveUamp(this.uamp).pipe(first()).subscribe(uamp => {
      this.uamp = uamp;
      this.uampService.assignUamp(uamp);
      this.toastService.showSuccess('UAMP saved successfully.');
      this.cancel();
    },
      (error) => {
        this.toastService.showError(this.toastService.getApiErrorMessage(error));
      });
  }

  cancel() {
    this.router.navigate(['uamp']);
  }

  onAccessibilityChange(operationPlan: OperationPlan, e) {
    operationPlan.leaseType = e.value.name;
  }
}
