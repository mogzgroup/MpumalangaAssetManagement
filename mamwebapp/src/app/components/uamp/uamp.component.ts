import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit, ChangeDetectionStrategy, TemplateRef, inject } from '@angular/core';
import { MatDialog, MatDialogRef, MatDialogTitle, MatDialogContent } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { MatTableDataSource, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatNoDataRow } from '@angular/material/table';
import { User } from 'src/app/models/user.model';
import { first } from 'rxjs/operators';
import { UAMP } from 'src/app/models/uamp.model';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ToastService } from 'src/app/services/toast.service';
import { UampService } from '../../services/uamp/uamp.service';
import { TempleteTwoPointOne } from 'src/app/models/templetes/templete-two-point-one.model';
import { Router } from '@angular/router';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { NgIf, NgTemplateOutlet, DatePipe } from '@angular/common';
import { MatProgressBar } from '@angular/material/progress-bar';
import { CdkScrollable } from '@angular/cdk/scrolling';

@Component({
    selector: 'app-uamp',
    templateUrl: './uamp.component.html',
    styleUrls: ['./uamp.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        MatButton,
        MatIcon,
        MatCard,
        MatCardContent,
        MatTable,
        MatSort,
        MatColumnDef,
        MatHeaderCellDef,
        MatHeaderCell,
        MatSortHeader,
        MatCellDef,
        MatCell,
        MatIconButton,
        MatMenuTrigger,
        MatHeaderRowDef,
        MatHeaderRow,
        MatRowDef,
        MatRow,
        MatNoDataRow,
        NgIf,
        MatProgressBar,
        NgTemplateOutlet,
        MatPaginator,
        MatMenu,
        MatMenuItem,
        MatCardHeader,
        MatDialogTitle,
        MatCardTitle,
        CdkScrollable,
        MatDialogContent,
        DatePipe,
    ],
})
export class UampComponent implements OnInit, OnDestroy, AfterViewInit {
  private router = inject(Router);
  private toastService = inject(ToastService);
  uampService = inject(UampService);
  private authenticationService = inject(AuthenticationService);
  private dialog = inject(MatDialog);

  templeteTwoPointOne: TempleteTwoPointOne;
  properties: any[] = [];
  generatingUamp = false;
  value = 0;
  uamps: UAMP[] = [];
  loadingUamps = false;
  uampLoadError = '';
  private progressTimer: ReturnType<typeof setInterval> | undefined;
  @ViewChild('uampProgressDialog') private uampProgressTemplate: TemplateRef<unknown>;
  private progressDialogRef: MatDialogRef<unknown> | null = null;
  dataSource = new MatTableDataSource<UAMP>([]);
  displayedColumns = ['fileReference', 'department', 'createdDate', 'creator', 'status', 'actions'];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  umapTemplete: any[];
  leasedPropertyCount = 0;
  activeIndex = 0;
  stateOwnedPropertyCount = 0;
  showDialog = false;
  showUAMP = false;
  currentUser: User;
  uamp: UAMP;
  templateOne: any;
  constructor() {
    this.startCounter();
    this.dataSource.sortingDataAccessor = (item, property) => {
      if (property === 'creator') {
        return `${item.user?.name || ''} ${item.user?.surname || ''}`.trim();
      }
      if (property === 'createdDate') {
        return item.createdDate ? new Date(item.createdDate).getTime() : 0;
      }
      return item[property] as string | number;
    };
  }

  startCounter() {
    if (this.progressTimer) {
      return;
    }
    this.progressTimer = setInterval(() => {
      this.value = this.value + Math.floor(Math.random() * 10) + 1;
      if (this.value >= 100) {
        this.value = 100;
        clearInterval(this.progressTimer);
        this.progressTimer = undefined;
      }
    }, 3000);
  }

  ngOnInit() {  
    this.authenticationService.currentUser.pipe().subscribe(x => {
      this.currentUser = x;
      if (x && !this.loadingUamps && this.uamps.length === 0 && !this.uampLoadError) {
        this.getUamps();
      }
    });
  }

  ngOnDestroy() {
    if (this.progressTimer) {
      clearInterval(this.progressTimer);
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  selectUamp(uamp) {
    this.uamp = uamp;
  }

  viewUamp() {
    this.showDialog = true;
    this.openProgressDialog();
    this.value = 10;
    this.uampService.getUamp(this.uamp.id).subscribe(
      (response) => {
        this.uamp = response;
        this.closeProgressDialog();
      },
      (error) => {
        this.toastService.showError(this.toastService.getApiErrorMessage(error));
        this.closeProgressDialog();
      }
    );

  }

  getUamps() {
    if (this.loadingUamps) {
      return;
    }
    if (!this.currentUser?.department) {
      this.uampLoadError = 'Unable to load UAMP records. Please try again.';
      this.toastService.showError(this.uampLoadError);
      return;
    }

    this.loadingUamps = true;
    this.uampLoadError = '';
    this.uampService.getUamps(this.currentUser.department).subscribe(
      (response) => {
        this.loadingUamps = false;
        if (!Array.isArray(response)) {
          this.uamps = [];
          this.dataSource.data = [];
          this.uampLoadError = 'Unable to load UAMP records. Please try again.';
          this.toastService.showError(this.uampLoadError);
          return;
        }
        this.uamps = response;
        this.dataSource.data = this.uamps;
      },
      (error) => {
        this.loadingUamps = false;
        this.uamps = [];
        this.dataSource.data = [];
        this.uampLoadError = 'Unable to load UAMP records. Please try again.';
        this.toastService.showError(this.toastService.getApiErrorMessage(error));
      }
    );
  }

  getUamp(id: number) {
    this.uampService.getuampwithtemplateone(id).subscribe(
      (response) => {
        this.uamp = response;
        this.closeProgressDialog();
        this.uampService.assignUamp(this.uamp);
        this.router.navigate(['uampDetails/uampTemp1']);
      },
      (error) => {
        this.toastService.showError(this.toastService.getApiErrorMessage(error));
        this.closeProgressDialog();
      }
    );
  }

  updateUamp() {
    this.showUAMP = true;
    this.openProgressDialog();
    this.activeIndex = 0;
    this.value = 10;
    this.startCounter();
    this.getUamp(this.uamp.id)   
  }

  startUamp() {
    this.openProgressDialog();
    const uamp: UAMP = {
      id: 0,
      status: 'New',
      fileReference: this.makeId(8),
      optimalSupportingAccommodationId: null,
      department: this.currentUser.department,
      createdDate: new Date(),
      userId: this.currentUser.id,
    };   
    this.openUAMP(uamp); 
  }

  openUAMP(uamp){
    this.uampService.startuamp(uamp).subscribe(
      (response) => {
        this.uamp = response;
        this.closeProgressDialog();
        this.uampService.assignUamp(this.uamp);
        this.router.navigate(['uampDetails/uampTemp1']);
      },
      (error) => {
        this.toastService.showError(this.toastService.getApiErrorMessage(error));
        this.closeProgressDialog();
      });
  }

  back() {
    let uamp: any = {};
    if (this.uamp) {
      uamp = this.uamp;
    }

    this.uampService.assignUamp(uamp);
  }

  next() {
    let uamp: any = {};
    if (this.uamp) {
      uamp = this.uamp;
    }
    this.uampService.assignUamp(uamp);
  }

  updatedUamp(data: UAMP) {
    if (data) {
      this.uamp = data;
    }
  }

  private openProgressDialog() {
    this.generatingUamp = true;
    const dialogRef = this.dialog.open(this.uampProgressTemplate, {
      width: '420px',
      maxWidth: '95vw',
      disableClose: true
    });
    this.progressDialogRef = dialogRef;
    dialogRef.afterClosed().subscribe(() => {
      if (this.progressDialogRef === dialogRef) {
        this.progressDialogRef = null;
        this.generatingUamp = false;
      }
    });
  }

  private closeProgressDialog() {
    this.progressDialogRef?.close();
    this.progressDialogRef = null;
    this.generatingUamp = false;
  }

  onSave() {
    this.uamp.status = "Saved";
    this.uampService.saveUamp(this.uamp).pipe(first()).subscribe(uamp => {
      this.uamp = uamp;
      this.uampService.assignUamp(uamp);
      this.toastService.showSuccess('UAMP saved successfully.');

      const foundUamp = this.uamps.filter(u => u.id == this.uamp.id);
      if (foundUamp.length == 0) {
        this.uamps.push(this.uamp);
      } else {
        const index = this.uamps.indexOf(foundUamp[0]);
        this.uamps[index] = uamp;
      }
      this.dataSource.data = this.uamps;

      this.activeIndex = 0;
      this.showUAMP = false;
    },
      (error) => {
        this.toastService.showError(this.toastService.getApiErrorMessage(error));
      });
  }

  onSubmit() {
    this.next();
    this.uamp.status = "Submitted";
    this.uampService.saveUamp(this.uamp).pipe(first()).subscribe(uamp => {
      this.uamp = uamp;
      this.uampService.assignUamp(uamp);
      this.toastService.showSuccess('UAMP submitted successfully.');

      const foundUamp = this.uamps.filter(u => u.id == this.uamp.id).length;
      if (foundUamp == 0) {
        this.uamps.push(this.uamp);
        this.dataSource.data = this.uamps;
      }
      this.activeIndex = 0;
      this.showUAMP = false;
    },
      (error) => {
        this.toastService.showError(this.toastService.getApiErrorMessage(error));
      });
  }

  makeId(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
}
