import { Component, OnInit, ChangeDetectionStrategy, TemplateRef, ViewChild, inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Camp } from 'src/app/models/camp.model';
import { User } from 'src/app/models/user.model';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CampService } from 'src/app/services/camp/camp.service';
import { ToastService } from 'src/app/services/toast.service';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatNoDataRow } from '@angular/material/table';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { NgIf, DatePipe } from '@angular/common';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatCard, MatCardHeader, MatCardTitle, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { TemplateOneComponent } from '../uamp/template-one/template-one.component';
import { TemplateTwoOneComponent } from '../uamp/template-two-one/template-two-one.component';
import { TemplateTwoTwoComponent } from '../uamp/template-two-two/template-two-two.component';
import { TemplateThreeComponent } from '../uamp/template-three/template-three.component';
import { TemplateFourOneComponent } from '../uamp/template-four-one/template-four-one.component';
import { TemplateFourTwoComponent } from '../uamp/template-four-two/template-four-two.component';
import { TemplateFiveOneComponent } from '../uamp/template-five-one/template-five-one.component';
import { TemplateFiveTwoComponent } from '../uamp/template-five-two/template-five-two.component';
import { TemplateFiveThreeComponent } from '../uamp/template-five-three/template-five-three.component';
import { TemplateSixComponent } from '../uamp/template-six/template-six.component';
import { TemplateSevenComponent } from '../uamp/template-seven/template-seven.component';

@Component({
    selector: 'app-camp',
    templateUrl: './camp.component.html',
    styleUrls: ['./camp.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatButton, MatIcon, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatIconButton, MatMenuTrigger, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatNoDataRow, NgIf, MatProgressBar, MatMenu, MatMenuItem, MatCard, MatCardHeader, MatCardTitle, MatCardContent, MatTabGroup, MatTab, TemplateOneComponent, TemplateTwoOneComponent, TemplateTwoTwoComponent, TemplateThreeComponent, TemplateFourOneComponent, TemplateFourTwoComponent, TemplateFiveOneComponent, TemplateFiveTwoComponent, TemplateFiveThreeComponent, TemplateSixComponent, TemplateSevenComponent, MatCardActions, DatePipe]
})
export class CampComponent implements OnInit {
  private toastService = inject(ToastService);
  campService = inject(CampService);
  private authenticationService = inject(AuthenticationService);
  private dialog = inject(MatDialog);

  private readonly department = 'Public works, roads & transport';
  loading = false;
  loadError = '';
  currentUser: User;
  camp: Camp;
  generatingCamp = false;
  showDialog = false;
  showCAMP = false;
  camps: Camp[] = [];
  value = 0;
  activeIndex = 0;
  displayedColumns = ['fileReference', 'department', 'createdDate', 'creator', 'status', 'actions'];
  templeteTwoPointTwo: any = { properties: [] };
  properties: any[] = [];
  mode = 'Edit';
  @ViewChild('campViewDialog') campViewDialog: TemplateRef<unknown>;
  @ViewChild('campEditorDialog') campEditorDialog: TemplateRef<unknown>;
  private campViewDialogRef: MatDialogRef<unknown> | null = null;
  private campEditorDialogRef: MatDialogRef<unknown> | null = null;

    ngOnInit() {
      this.authenticationService.currentUser.pipe().subscribe(x => {
        this.currentUser = x;
      });
      this.getCamps(this.department);
    }

    
  getCampDetails(id: number) {
    this.campService.getCampDetails(id).subscribe(
      (response) => {
        this.camp = response;
        this.generatingCamp = false;
        if (this.campViewDialogRef) {
          this.campViewDialogRef.disableClose = false;
        }
      },
      () => {
        this.toastService.showError('Unable to load CAMP details. Please try again.');
        this.generatingCamp = false;
        if (this.campViewDialogRef) {
          this.campViewDialogRef.disableClose = false;
        }
      }
    );
  }

  getCamps(department: string) {
    if (this.loading) {
      return;
    }

    this.loading = true;
    this.loadError = '';
    this.campService.getCamps(department).subscribe(
      (response) => {
        this.loading = false;
        if (!Array.isArray(response)) {
          this.camps = [];
          this.loadError = 'Unable to load CAMP records. Please try again.';
          this.toastService.showError(this.loadError);
          return;
        }
        this.camps = response;
      },
      () => {
        this.camps = [];
        this.loading = false;
        this.loadError = 'Unable to load CAMP records. Please try again.';
        this.toastService.showError(this.loadError);
      }
    );
  }

  retryGetCamps() {
    this.getCamps(this.department);
  }

  viewCamp() {
    this.showDialog = true;
    this.generatingCamp = true;
    this.value = 10;
    this.campViewDialogRef = this.dialog.open(this.campViewDialog);
    this.campViewDialogRef.disableClose = true;
    this.campViewDialogRef.afterClosed().subscribe(() => {
      this.showDialog = false;
      this.campViewDialogRef = null;
    });
    this.getCampDetails(this.camp.id);
  }

  startCamp() {
    this.showCAMP = true;
    this.generatingCamp = true;
    this.activeIndex = 0;
    this.campEditorDialogRef = this.dialog.open(this.campEditorDialog);
    this.campEditorDialogRef.afterClosed().subscribe(() => {
      this.showCAMP = false;
      this.generatingCamp = false;
      this.campEditorDialogRef = null;
    });
  }

  selectCamp(camp: Camp) {
    this.camp = camp;
  }

  updatedCamp(data: any) {
    if (data) {
      this.camp = data;
    }
  }

  next() {
    this.activeIndex = this.activeIndex + 1;
  }

  back() {
    this.activeIndex = this.activeIndex - 1;
  }

  cancel() {
    this.campEditorDialogRef?.close();
  }

  onSave() {
    this.campEditorDialogRef?.close();
  }

  onSubmit() {
    this.campEditorDialogRef?.close();
  }

  closeViewDialog() {
    if (!this.generatingCamp) {
      this.campViewDialogRef?.close();
    }
  }
}
