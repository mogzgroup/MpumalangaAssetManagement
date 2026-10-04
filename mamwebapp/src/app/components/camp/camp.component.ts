import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Camp } from 'src/app/models/camp.model';
import { User } from 'src/app/models/user.model';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CampService } from 'src/app/services/camp/camp.service';

@Component({
  standalone: false,
  selector: 'app-camp',
  templateUrl: './camp.component.html',
  styleUrls: ['./camp.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [MessageService, ConfirmationService]
})
export class CampComponent implements OnInit {
  loading:boolean = false;
  currentUser: User;
  camp: Camp;
  items = [
    { icon: 'pi pi-home',url: 'dashboard' },
    { label: 'CAMP' }];
  generatingCamp: boolean = false;
  showDialog: boolean = false;
  showCAMP: boolean = false;
  camps: Array<Camp> = [];
  value: number = 0;
  activeIndex: number = 0;
  buttonItems: any[] = [];
  templeteTwoPointTwo: any = { properties: [] };
  properties: any[] = [];
  erMsgs: any[] = [];
  error: string = '';
  mode: string = 'Edit';

  constructor(private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private changeDetectionRef: ChangeDetectorRef,public campService: CampService, 
    private authenticationService: AuthenticationService) {
      this.buttonItems = [
        { label: 'View', icon: 'pi pi-eye', command: () => this.viewCamp() }
      ];
    }

    ngOnInit() {
      this.authenticationService.currentUser.pipe().subscribe(x => {
        this.currentUser = x;
      });
      this.getCamps("Public works, roads & transport");
    }

    
  getCampDetails(id: number) {
    this.campService.getCampDetails(id).subscribe(
      (response) => {
        this.camp = response;
        this.generatingCamp = false;
      },
      (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error Occoured', detail: 'Unable to get CAMP details' });
        this.generatingCamp = false;
      }
    );
  }

  getCamps(department: string) {
    this.campService.getCamps(department).subscribe(
      (response) => {
        this.camps = response;
        this.loading = false;
      },
      (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error Occoured', detail: 'Unable to get CAMP details' });
        this.generatingCamp = false;
      }
    );
  }

  viewCamp() {
    this.showDialog = true;
    this.generatingCamp = true;
    this.value = 10;
    this.getCampDetails(this.camp.id);
  }

  startCamp() {
    this.showCAMP = true;
    this.generatingCamp = true;
    this.activeIndex = 0;
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
    this.showCAMP = false;
    this.generatingCamp = false;
  }

  onSave() {
    this.showCAMP = false;
  }

  onSubmit() {
    this.showCAMP = false;
  }
}

