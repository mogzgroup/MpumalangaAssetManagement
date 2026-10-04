import { Component, OnInit, Input, ViewChild, AfterViewInit, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { Subject } from 'rxjs/internal/Subject';
import { first } from 'rxjs/operators';
import { MenuItem, MessageService } from 'primeng/api';
import { UAMP } from 'src/app/models/uamp.model';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { UampService } from '../../services/uamp/uamp.service';
import { TempleteTwoPointOne } from 'src/app/models/templetes/templete-two-point-one.model';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-uamp',
  templateUrl: './uamp.component.html',
  styleUrls: ['./uamp.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [MessageService],
})
export class UampComponent implements OnInit { 
  templeteTwoPointOne: TempleteTwoPointOne;
  properties: any[] = [];
  generatingUamp: boolean = false;
  value: number = 0;
  uamps: UAMP[];
  umapTemplete: any[];
  leasedPropertyCount: Number = 0;
  activeIndex: number = 0;
  stateOwnedPropertyCount: Number = 0;
  showDialog: Boolean = false;
  showUAMP: Boolean = false;
  currentUser: User;
  uamp: UAMP;
  buttonItems: MenuItem[];
  templateOne: any;
  erMsgs: { severity: string; summary: string; detail: string }[] = [];
  error: string = '';
  items = [
    { icon: 'pi pi-home',url: 'dashboard' },
    { label: 'UAMP' }];

  constructor(private router: Router, public messageService: MessageService, public uampService: UampService, private authenticationService: AuthenticationService) {
    this.startCounter();
    this.buttonItems = [
      {
        label: 'View', icon: 'pi pi-eye', command: () =>
          this.viewUamp()
      },
      { separator: true },
      {
        label: 'Update', icon: 'pi pi-print', command: () =>
          this.updateUamp()
      }
    ];
  }

  startCounter() {
    let interval = setInterval(() => {
      this.value = this.value + Math.floor(Math.random() * 10) + 1;
      this.erMsgs = [];
      if (this.value >= 100) {
        this.value = 100;
        //clearInterval(interval);   
      }
    }, 3000);
  }

  ngOnInit() {  
    this.authenticationService.currentUser.pipe().subscribe(x => {
      this.currentUser = x;
    });
    this.getUamps();
  }
  selectUamp(uamp) {
    this.uamp = uamp;
  }

  viewUamp() {
    this.showDialog = true;
    this.generatingUamp = true;
    this.value = 10;
    this.uampService.getUamp(this.uamp.id).subscribe(
      (response) => {
        this.uamp = response;
        this.generatingUamp = false;
      },
      (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error Occoured', detail: 'Unable to get UAMP details' });
        this.generatingUamp = false;
      }
    );

  }

  getUamps() {
    this.uamps = [];
    this.uampService.getUamps(this.currentUser.department).subscribe(
      (response) => {
        this.uamps = response
      },
      (error) => {
        this.erMsgs = [{ severity: 'error', summary: 'Error Occoured', detail: 'Unable to get UAMPS for your department' }];
      }
    );
  }

  getUamp(id: Number) {
    this.uampService.getuampwithtemplateone(id).subscribe(
      (response) => {
        this.uamp = response;
        this.generatingUamp = false;
        this.uampService.assignUamp(this.uamp);
        this.router.navigate(['uampDetails/uampTemp1']);
      },
      (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error Occoured', detail: 'Unable to get UAMP details' });
        this.generatingUamp = false;
      }
    );
  }

  updateUamp() {
    this.showUAMP = true;
    this.generatingUamp = true;
    this.activeIndex = 0;
    this.value = 10;
    this.startCounter();
    this.getUamp(this.uamp.id)   
  }

  startUamp() {
    this.generatingUamp = true;
    let uamp: UAMP = {
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
        this.generatingUamp = false;
        this.uampService.assignUamp(this.uamp);
        this.router.navigate(['uampDetails/uampTemp1']);
      },
      (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error Occoured', detail: 'Unable to generate UAMP' });
        this.generatingUamp = false;
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

  onSave() {
    this.uamp.status = "Saved";
    this.uampService.saveUamp(this.uamp).pipe(first()).subscribe(uamp => {
      this.uamp = uamp;
      this.uampService.assignUamp(uamp);
      this.messageService.add({ severity: 'success', summary: 'Save UAMP', detail: 'UAMP has been saved successful.' });

      const foundUamp = this.uamps.filter(u => u.id == this.uamp.id);
      if (foundUamp.length == 0)
        this.uamps.push(this.uamp);
      else {
        const index = this.uamps.indexOf(foundUamp[0]);
        this.uamps[index] = uamp;
      }

      this.activeIndex = 0;
      this.showUAMP = false;
    },
      (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error Occoured', detail: 'Unable to save UAMP' });
      });
  }

  onSubmit() {
    this.next();
    this.uamp.status = "Submitted";
    this.uampService.saveUamp(this.uamp).pipe(first()).subscribe(uamp => {
      this.uamp = uamp;
      this.uampService.assignUamp(uamp);
      this.messageService.add({ severity: 'success', summary: 'Submit UAMP', detail: 'UAMP has been submited successful.' });

      const foundUamp = this.uamps.filter(u => u.id == this.uamp.id).length;
      if (foundUamp == 0)
        this.uamps.push(this.uamp);
      this.activeIndex = 0;
      this.showUAMP = false;
    },
      (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error Occoured', detail: 'Unable to submit UAMP' });
      });
  }

  makeId(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
}

