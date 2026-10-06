import { Component, OnInit, ChangeDetectionStrategy, ViewChild, AfterViewInit, TemplateRef, inject } from '@angular/core';
import { MatDialog, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { MatTableDataSource, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatNoDataRow } from '@angular/material/table';
import { Project } from 'src/app/models/project.model';
import { User } from 'src/app/models/user.model';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ProjectService } from 'src/app/services/facility-management/project.service';
import { ToastService } from 'src/app/services/toast.service';
import { NgIf, NgFor } from '@angular/common';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel, MatPrefix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatCard, MatCardHeader, MatCardTitle, MatCardContent } from '@angular/material/card';
import { AddEditProjectComponent } from './addeditproject/add-edit-project.component';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-project',
    templateUrl: './project.component.html',
    styleUrls: ['./project.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [NgIf, MatButton, MatIcon, MatFormField, MatLabel, MatPrefix, MatInput, MatTable, MatSort, NgFor, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatSortHeader, MatCellDef, MatCell, MatIconButton, MatMenuTrigger, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatNoDataRow, MatProgressBar, MatPaginator, MatMenu, MatMenuItem, MatCard, MatCardHeader, MatCardTitle, MatCardContent, AddEditProjectComponent, MatDialogTitle, CdkScrollable, MatDialogContent, MatDialogActions, MatProgressSpinner]
})
export class ProjectComponent implements OnInit, AfterViewInit {
  private authenticationService = inject(AuthenticationService);
  private projectService = inject(ProjectService);
  private toastService = inject(ToastService);
  private dialog = inject(MatDialog);


  public dialogHeader = '';
  public project: Project;
  public isSuccessful = false;
  public loading = false;
  public loadError = '';
  public deletingProject = false;
  public projects: any[] = [];
  public projectsInProgress = 0;
  public serviceRequestsLogged = 0;
  public completedRequests = 0;
  public awaitingSignOff = 0;
  public currentUser: User;
  @ViewChild('projectDialog') projectDialog: TemplateRef<unknown>;
  @ViewChild('deleteProjectDialog') deleteProjectDialog: TemplateRef<unknown>;
  private projectDialogRef: MatDialogRef<unknown> | null = null;
  private deleteProjectDialogRef: MatDialogRef<unknown> | null = null;
  public cols = [
    { field: 'district', header: 'District' },
    { field: 'name', header: 'Name' },
    { field: 'managedBy', header: 'Managed By' },
    { field: 'status', header: 'Status' }
  ];
  displayedColumns = this.cols.map(col => col.field).concat('actions');
  dataSource = new MatTableDataSource<any>([]);
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  ngOnInit() {
    this.authenticationService.currentUser.pipe().subscribe(x => {
      this.currentUser = x;
    });

    this.loadProjects();
  }

  loadProjects() {
    if (this.loading) {
      return;
    }
    this.loading = true;
    this.loadError = '';
    this.projectService.getProjects().subscribe(projects => {
      this.loading = false;
      if (!Array.isArray(projects)) {
        this.projects = [];
        this.dataSource.data = [];
        this.loadError = 'Unable to load projects. Please try again.';
        this.toastService.showError(this.loadError);
        return;
      }
      this.projects = projects;
      this.dataSource.data = this.projects;
      this.isSuccessful = true;
    },
      error => {
        this.loading = false;
        this.projects = [];
        this.dataSource.data = [];
        this.isSuccessful = false;
        this.loadError = 'Unable to load projects. Please try again.';
        this.toastService.showError(this.toastService.getApiErrorMessage(error));
      });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(value: string) {
    this.dataSource.filter = value.trim().toLowerCase();
    this.dataSource.paginator?.firstPage();
  }

  confirmDeleteProject() {
    this.deleteProjectDialogRef = this.dialog.open(this.deleteProjectDialog, {
      width: 'min(92vw, 440px)'
    });
    const dialogRef = this.deleteProjectDialogRef;
    dialogRef.afterClosed().subscribe(() => {
      if (this.deleteProjectDialogRef === dialogRef) {
        this.deleteProjectDialogRef = null;
      }
    });
  }

  closeDeleteProjectDialog() {
    if (!this.deletingProject) {
      this.deleteProjectDialogRef?.close();
    }
  }

  deleteProject() {
    if (this.deletingProject || !this.project) {
      return;
    }
    this.deletingProject = true;
    if (this.deleteProjectDialogRef) {
      this.deleteProjectDialogRef.disableClose = true;
    }
    this.projectService.deleteProject(this.project).subscribe(isDeleted => {
      if (isDeleted) {
        this.toastService.showSuccess('Project deleted successfully.');
        this.deleteProjectDialogRef?.close();
        const index = this.projects.indexOf(this.project);
        this.projects.splice(index, 1);
        this.dataSource.data = this.projects;
      } else if (this.deleteProjectDialogRef) {
        this.deleteProjectDialogRef.disableClose = false;
      }
      this.deletingProject = false;
    },
      () => {
        this.deletingProject = false;
        if (this.deleteProjectDialogRef) {
          this.deleteProjectDialogRef.disableClose = false;
        }
        this.toastService.showError('Unable to delete this project. Please try again.');
      });
  }

  updateProject() {
    this.dialogHeader = 'Edit Project';
    this.openProjectDialog();
  }

  viewProject() {
    this.dialogHeader = 'View Project';
    this.openProjectDialog();
  }

  openNewProjectDialog() {
    this.addProject();
    this.dialogHeader = 'New Project';
    this.openProjectDialog();
  }

  private openProjectDialog() {
    this.projectDialogRef = this.dialog.open(this.projectDialog, {
      width: 'min(92vw, 1100px)',
      maxWidth: 'calc(100vw - 24px)',
      maxHeight: 'calc(100dvh - 24px)',
      panelClass: 'project-management-dialog'
    });
    this.projectDialogRef.afterClosed().subscribe(() => {
      this.projectDialogRef = null;
    });
  }

  closeProjectDialog() {
    this.projectDialogRef?.close();
  }

  printProject() { }

  getOrderNumber(length): string {
    let result = '';
    const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  addProject() {
    this.project = {
      id: 0,
      orderNumber: this.getOrderNumber(7),
      district: '',
      propertyId: 0,
      name: '',
      plannedDuration: '',
      startDate: new Date,
      practicalCompletionDate: new Date(),
      scopeofWork: '',
      hasFinancials: false,
      hasParentProject: false,
      parentProjectId: null,
      amount: 0,
      account: 0,
      managedBy: '',
      employeeName: '',
      employeeNumber: null,
      contactName: '',
      contactNumber: '',
      businessName: '',
      businessRegNumber: '',
      createdDate: new Date(),
      modifiedDate: null,
      projectSuppliers: [],
      isDeleted: false,
      status: 'New'
    };
  }

  selectProject(project: Project) {
    this.project = project;
  }

  addUpdateAsset(project: Project) {
    if (!project) {
      return;
    }
    this.project = project;
    const existingIndex = this.projects.findIndex(item => item.id === project.id);
    if (existingIndex >= 0) {
      this.projects[existingIndex] = project;
    } else {
      this.projects.push(project);
    }
    this.dataSource.data = [...this.projects];
    this.projectDialogRef?.close();
  }


}
