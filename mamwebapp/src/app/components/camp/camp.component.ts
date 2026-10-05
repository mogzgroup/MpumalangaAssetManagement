import { Component, OnInit, ChangeDetectionStrategy, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Camp } from 'src/app/models/camp.model';
import { User } from 'src/app/models/user.model';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CampService } from 'src/app/services/camp/camp.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  standalone: false,
  selector: 'app-camp',
  templateUrl: './camp.component.html',
  styleUrls: ['./camp.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager
})
export class CampComponent implements OnInit {
  private readonly department = 'Public works, roads & transport';
  loading: boolean = false;
  loadError = '';
  currentUser: User;
  camp: Camp;
  generatingCamp: boolean = false;
  showDialog: boolean = false;
  showCAMP: boolean = false;
  camps: Array<Camp> = [];
  value: number = 0;
  activeIndex: number = 0;
  displayedColumns = ['fileReference', 'department', 'createdDate', 'creator', 'status', 'actions'];
  templeteTwoPointTwo: any = { properties: [] };
  properties: any[] = [];
  mode: string = 'Edit';
  @ViewChild('campViewDialog') campViewDialog: TemplateRef<unknown>;
  @ViewChild('campEditorDialog') campEditorDialog: TemplateRef<unknown>;
  private campViewDialogRef: MatDialogRef<unknown> | null = null;
  private campEditorDialogRef: MatDialogRef<unknown> | null = null;

  constructor(
    private toastService: ToastService,
    public campService: CampService,
    private authenticationService: AuthenticationService,
    private dialog: MatDialog
  ) { }

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
