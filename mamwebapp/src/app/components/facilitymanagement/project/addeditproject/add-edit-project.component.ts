import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProjectSupplier } from 'src/app/models/project-supplier';
import { Project } from 'src/app/models/project.model';
import { User } from 'src/app/models/user.model';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ProjectService } from 'src/app/services/facility-management/project.service';
import { SupplierService } from 'src/app/services/facility-management/supplier.service';
import { SharedService } from 'src/app/services/shared.service';
import { ToastService } from 'src/app/services/toast.service';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { MatFormField, MatLabel, MatError, MatSuffix } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';

import { MatOption } from '@angular/material/autocomplete';
import { MatInput } from '@angular/material/input';
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-add-edit-project',
    templateUrl: './add-edit-project.component.html',
    styleUrls: ['./add-edit-project.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatTabGroup, MatTab, FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatSelect, MatOption, MatError, MatInput, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, MatDatepickerInput, MatDatepickerToggle, MatSuffix, MatDatepicker, MatCheckbox, MatButton, MatIcon, MatIconButton, MatProgressSpinner]
})
export class AddEditProjectComponent implements OnInit {
  private authenticationService = inject(AuthenticationService);
  private formBuilder = inject(FormBuilder);
  private supplierService = inject(SupplierService);
  private sharedService = inject(SharedService);
  private projectService = inject(ProjectService);
  private toastService = inject(ToastService);


  @Input() project: Project;
  @Input() isViewOnly = false;
  @Output() newAsset = new EventEmitter<Project>();
  public isSuccessful = false;
  public projectForm: FormGroup;
  public submitted = false;
  public mode = 'Edit';
  public showAssets = false;
  public showAll = false;

  val: string;
  val6: string;
  public isManagedByExternalCompany = false;
  public hasParentChecked = false;
  public financeChecked = false;
  public loading = false;

  public managedByForm: FormGroup;
  public supplierForm: FormGroup;
  public projects: Project[] = [];
  public projectList: any[] = [];
  public suppliers: any[] = [];
  public supplierDropdownOptions: any[] = [];

  public projectsInProgress = 0;
  public serviceRequestsLogged = 0;
  public completedRequests = 0;
  public awaitingSignOff = 0;
  public currentUser: User;
  public showDialog: boolean;
  public districts: any[] = [];
  public properties: any[] = [];
  public hasParentProject = false;
  public parentProjectHasFinance = false;
  public activeIndex = 0;
  public managedBylist: any[] = [];
  public selectedSupplierIndex = 0;
  public supplierFilter = '';
  public projectSupplier: any =  {
    companyName: '',
    companyNumber: '',
    contactName: '',
    contactNumber: '',
  };
  public supplierCols = [
    { field: 'companyName', header: 'Company Name' },
    { field: 'companyNumber', header: 'Company Number' },
    { field: 'contactName', header: 'Contact Name' },
    { field: 'contactNumber', header: 'Contact Number' }
  ];

  ngOnInit() {
    this.mode = this.isViewOnly ? 'View' : 'Edit';
    this.authenticationService.currentUser.pipe().subscribe(x => {
      this.currentUser = x;
    });

    this.districts = this.sharedService.getDistricts();
    this.properties = [
      { name: 'Loading...', code: '0', factor: 0 }
    ];

    this.supplierService.getSuppliers().subscribe(suppliers => {
      if (suppliers.length > 0) {
        this.suppliers = suppliers;
        this.supplierDropdownOptions = [];
        suppliers.forEach(element => {
           const option = { name: element.companyName + ' - ' + element.companyNumber , code: element.id, factor: 1 };
           this.supplierDropdownOptions.push(option);
        });
      }
    },
    error => {
      this.toastService.showError(this.toastService.getApiErrorMessage(error));
      this.isSuccessful = false;
    });

    this.projectService.getProperties().subscribe(propertyList => {
      if (propertyList.length > 0) {

        this.properties = [];
        propertyList.forEach(element => {
           const option = { name: element.clientCode + ' - ' + element.name, code: element.id, factor: element.id };
           this.properties.push(option);
        });
        this.SetPropertyDropdown();
      }
    },
    error => {
      this.toastService.showError(this.toastService.getApiErrorMessage(error));
      this.isSuccessful = false;
    });

    this.managedBylist = this.sharedService.getManagedBylist();

    this.projectList = [
      { name: 'N1 repair', code: '1', factor: 1 }
    ];

    this.buildForm();
  }

  get f() { return this.projectForm ? this.projectForm.controls : {}; }
  get s() { return this.projectForm ? this.projectForm.controls : {}; }
  get m() { return this.managedByForm ? this.managedByForm.controls : {}; }
  get filteredProjectSuppliers() {
    const suppliers = this.project?.projectSuppliers ?? [];
    const filter = this.supplierFilter.trim().toLowerCase();
    if (!filter) {
      return suppliers;
    }

    return suppliers.filter(supplier =>
      this.supplierCols.some(column =>
        String(supplier[column.field] ?? '').toLowerCase().includes(filter)
      )
    );
  }

  SetPropertyDropdown() {
    const property = this.properties.filter(d => Number(d.code) === this.project.propertyId)[0];
    this.projectForm.controls['property'].setValue(property);
  }

  buildForm() {
    if (this.project.id > 0) {
      const district = this.districts.filter(d => d.name === this.project.district)[0];
      this.financeChecked = this.project.hasFinancials;
      this.hasParentChecked = this.project.hasParentProject;

      this.projectForm = this.formBuilder.group({
          district: [district, Validators.required],
          property: ['', Validators.required],
          name: [this.project.name, Validators.required],
        hasParentProject: [this.project.hasParentProject],
        hasProjectFinance: [this.project.hasFinancials],
        duration: [this.project.plannedDuration],
        amount: [this.project.amount, Validators.min(0)],
        account: [this.project.account, Validators.min(0)],
        startDate: [new Date(this.project.startDate), Validators.required],
        scope: [this.project.scopeofWork, Validators.required],
        completionDate: [new Date(this.project.practicalCompletionDate), Validators.required]
      });
  
      const managedByEmployee = this.managedBylist.filter(m => m.name === this.project.managedBy)[0];
      this.isManagedByExternalCompany = managedByEmployee?.factor === 2;
      this.managedByForm = this.formBuilder.group({
        managedBy: [managedByEmployee, Validators.required],
        name: [this.project.managedBy === 'Employee' ?  this.project.employeeName : this.project.businessName, Validators.required],
        employeeCompanyNumber: [this.project.managedBy === 'Employee' ?  this.project.employeeNumber : this.project.businessRegNumber],
        contactName: [this.project.contactName],
        contactNumber: [this.project.contactNumber],
      });
  
      this.supplierForm = this.formBuilder.group({
        supplier: [''],
        companyName: [''],
        companyNumber: [''],
        contactName: [''],
        contactNumber: [''],
      });
    } else {
    this.projectForm = this.formBuilder.group({
      district: ['', Validators.required],
      property: ['', Validators.required],
      name: ['', Validators.required],
      hasParentProject: [''],
      hasProjectFinance: [''],
      duration: [''],
      amount: ['', Validators.min(0)],
      account: ['', Validators.min(0)],
      startDate: ['', Validators.required],
      scope: ['', Validators.required],
      completionDate: ['', Validators.required]
    });

    const managedByEmployee = this.managedBylist[0];
    this.managedByForm = this.formBuilder.group({
      managedBy: [managedByEmployee, Validators.required],
      name: ['', Validators.required],
      employeeCompanyNumber: [''],
      contactName: [''],
      contactNumber: [''],
    });

    this.supplierForm = this.formBuilder.group({
      supplier: [''],
      companyName: [''],
      companyNumber: [''],
      contactName: [''],
      contactNumber: [''],
    });
  }
  }

  saveDetails() {
    if (this.loading || this.isViewOnly) {
      return;
    }
    this.submitted = true;
    if (this.activeIndex === 0) {
      this.projectForm.markAllAsTouched();
      if (this.projectForm.invalid) {
        return;
      }
      this.assignProject();
      if (this.project.id > 0) {
        this.updateProject();
      } else {
        this.addProject();
      }
    } else if (this.activeIndex === 1) {
      this.managedByForm.markAllAsTouched();
      if (this.managedByForm.invalid) {
        return;
      }
      this.assignManager();
      this.updateProject();
    }
  }
  confirmDeleteProject() { }

  updateProject() {
    if (this.loading) {
      return;
    }
    this.loading = true;
    this.projectService.updateProject(this.project).pipe().subscribe(isUpdated => {
      this.loading = false;
      if (isUpdated) {
        this.toastService.showSuccess('Project saved successfully.');
        this.isSuccessful = true;
        this.activeIndex = this.activeIndex + 1;
      } else {
        this.toastService.showError('Unable to save the project. Please try again.');
      }
    },
      error => {
        this.loading = false;
        this.toastService.showError(this.toastService.getApiErrorMessage(error));
        this.isSuccessful = false;
      });
   }

  viewProject() { }

  printProject() { }

  onSaveSuppliers() {
    if (this.loading || this.isViewOnly) {
      return;
    }
    this.AddProjectSuppliers();
  }

  AddProjectSuppliers() {
    if (this.loading) {
      return;
    }
    this.loading = true;
    this.projectService.updateProject(this.project).pipe().subscribe(project => {
      this.loading = false;
      if (project) {
        this.toastService.showSuccess('Project details saved successfully.');
        this.isSuccessful = true;
        this.project = project;
        this.newAsset.emit(project);
      } else {
        this.toastService.showError('Unable to save project details. Please try again.');
      }
    },
      error => {
        this.loading = false;
        this.toastService.showError(this.toastService.getApiErrorMessage(error));
        this.isSuccessful = false;
      });
  }

  addProject() {
    if (this.loading) {
      return;
    }
    this.loading = true;
    this.projectService.addProject(this.project).pipe().subscribe(id => {
      this.loading = false;
      if (id > 0) {
        this.project.id = id;
        this.toastService.showSuccess('Project created successfully.');
        this.isSuccessful = true;
        this.activeIndex = this.activeIndex + 1;
      } else {
        this.toastService.showError('Unable to create the project. Please try again.');
      }
    },
      error => {
        this.loading = false;
        this.toastService.showError(this.toastService.getApiErrorMessage(error));
        this.isSuccessful = false;
      });
  }

  assignManager() {
    if (this.isManagedByExternalCompany) {
      this.project.businessName = this.managedByForm.controls['name'].value;
      this.project.businessRegNumber = this.managedByForm.controls['employeeCompanyNumber'].value.toString();
      this.project.employeeName = null;
      this.project.employeeNumber = null;
    } else {
      this.project.employeeName = this.managedByForm.controls['name'].value;
      this.project.employeeNumber = Number(this.managedByForm.controls['employeeCompanyNumber'].value);
      this.project.businessName = null;
      this.project.businessRegNumber = null;
    }

    this.project.contactName = this.managedByForm.controls['contactName'].value;
    this.project.contactNumber = this.managedByForm.controls['contactNumber'].value;
  }

  assignProject() {

    this.project.name = this.projectForm.controls['name'].value;
    this.project.plannedDuration = this.projectForm.controls['duration'].value;
    this.project.amount = this.projectForm.controls['amount'].value != '' ? Number(this.projectForm.controls['amount'].value) : null;
    this.project.account = this.projectForm.controls['amount'].value != '' ? this.projectForm.controls['account'].value : null;
    this.project.startDate = this.projectForm.controls['startDate'].value;
    this.project.scopeofWork = this.projectForm.controls['scope'].value;
    this.project.practicalCompletionDate = this.projectForm.controls['completionDate'].value;

    return this.project;

  }

  onDistrictChange(e: any) {
    this.project.district = (e.value ?? e).name;
  }

  onPropertyChange(e: any) {
    this.project.propertyId = Number((e.value ?? e).code);
  }

  onProperty(e: any) {
    this.onPropertyChange(e);
  }

  hasParentChange(e) {
    this.hasParentChecked = e.checked;
    this.project.hasParentProject = e.checked;
  }

  hasProjectFinanceChange(e) {
    this.financeChecked = e.checked;
    this.project.hasFinancials = e.checked;
    const amountControl = this.projectForm.controls['amount'];
    amountControl.setValidators(e.checked ? [Validators.required, Validators.min(0)] : [Validators.min(0)]);
    amountControl.updateValueAndValidity();
  }

  onManagedByChange(e) {
    const value = e.value ?? e;
    if (value.factor === 2) {
      this.isManagedByExternalCompany = true;
    } else {
      this.isManagedByExternalCompany = false;      
    }
    this.managedByForm.controls['employeeCompanyNumber'].setValue('');
    this.project.managedBy = value.name;
  }

  onSupplierChange(e){
    this.projectSupplier = e.value ?? e;
  }

  onAddSupplier() {
    const supplier = this.suppliers.filter(s => s.id === this.projectSupplier.code)[0];
    const projectSupplier: ProjectSupplier = {
      id: 0,
      projectId: this.project.id,
      supplierId: supplier.code,
    };
    this.project.projectSuppliers.push(projectSupplier);
  }

  selectSupplier(projectSupplier: any) {
    this.projectSupplier = projectSupplier;
  }

  deleteSupplier() {
    const index = this.project.projectSuppliers.indexOf(this.projectSupplier);
    this.project.projectSuppliers.splice(index, 1);
  }

}
