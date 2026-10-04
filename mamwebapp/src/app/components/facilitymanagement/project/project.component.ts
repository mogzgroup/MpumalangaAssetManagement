import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Project } from 'src/app/models/project.model';
import { User } from 'src/app/models/user.model';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ProjectService } from 'src/app/services/facility-management/project.service';

@Component({
  standalone: false,
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [MessageService, ConfirmationService]
})
export class ProjectComponent implements OnInit {

  public error = '';
  public dialogHeader = '';
  public project: Project;
  public isSuccessful: boolean = false;
  public loading: boolean = false;
  public projects: Array<any> = [];
  public showdelete: boolean = false;
  public projectsInProgress: number = 0;
  public serviceRequestsLogged: number = 0;
  public completedRequests: number = 0;
  public awaitingSignOff: number = 0;
  public errorMsg: string;
  public currentUser: User;
  public showDialog: boolean;
  public cols = [
    { field: 'district', header: 'District' },
    { field: 'name', header: 'Name' },
    { field: 'managedBy', header: 'Managed By' },
    { field: 'status', header: 'Status' }
  ];
  buttonItems: MenuItem[];

  public items: any = [{ icon: 'pi pi-home', url: 'dashboard' },
  { label: 'Facility Management' }
  ];


  constructor(private authenticationService: AuthenticationService, private projectService: ProjectService, private messageService: MessageService) { }

  ngOnInit() {
    this.authenticationService.currentUser.pipe().subscribe(x => {
      this.currentUser = x;
    });

    this.buttonItems = [
      {
        label: 'View', icon: 'pi pi-eye', command: () =>
          this.viewProject()
      },
      { separator: true },
      {
        label: 'Print', icon: 'pi pi-print', command: () =>
          this.printProject()
      },
      { separator: true },
      {
        label: 'Update', icon: 'pi pi-pencil', command: () =>
          this.updateProject()
      },
      { separator: true },
      {
        label: 'Delete', icon: 'pi pi-trash', command: () =>
          this.confirmDeleteProject()
      }];
    this.projectService.getProjects().subscribe(projects => {
      if (projects.length > 0) {
        this.projects = [];
        projects.forEach(project => {
           // project.managedBy = project.employeeName !== '' ? project.employeeName + ' - ' + project.employeeNumber
           //   : project.businessName + ' - ' + project.businessRegNumber,
          this.projects.push(project);
        });

        this.isSuccessful = true;
      }
    },
      (error) => {
        this.isSuccessful = false;
      });

  }

  confirmDeleteProject() {
    this.showdelete = true;
  }

  showToast(summary: string, detail: string, severity: string) {
    this.messageService.add({ severity, summary, detail });
  }

  deleteProject() {
    this.projectService.deleteProject(this.project).subscribe(isDeleted => {
      if (isDeleted) {
        this.showToast('Delete project', 'Project has been deleted successfully.', 'success');
        this.showdelete = false;
        const index = this.projects.indexOf(this.project);
        this.projects.splice(index, 1);
      }
    },
      (error) => {
        this.messageService.add({
          severity: 'error', summary: 'Error Occurred',
          detail: 'An error occurred while processing your request. please try again!'
        });
        this.showdelete = false;
      });
  }

  updateProject() { }

  viewProject() {
    this.showDialog = true;
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

  addUpdateAsset(event: any) { }


}
