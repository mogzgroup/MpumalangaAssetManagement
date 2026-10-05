import { Component, OnInit, ChangeDetectionStrategy, ViewChild, AfterViewInit, TemplateRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Project } from 'src/app/models/project.model';
import { User } from 'src/app/models/user.model';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ProjectService } from 'src/app/services/facility-management/project.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  standalone: false,
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager
})
export class ProjectComponent implements OnInit, AfterViewInit {

  public dialogHeader = '';
  public project: Project;
  public isSuccessful: boolean = false;
  public loading: boolean = false;
  public loadError = '';
  public deletingProject = false;
  public projects: Array<any> = [];
  public projectsInProgress: number = 0;
  public serviceRequestsLogged: number = 0;
  public completedRequests: number = 0;
  public awaitingSignOff: number = 0;
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


  constructor(
    private authenticationService: AuthenticationService,
    private projectService: ProjectService,
    private toastService: ToastService,
    private dialog: MatDialog
  ) { }

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
