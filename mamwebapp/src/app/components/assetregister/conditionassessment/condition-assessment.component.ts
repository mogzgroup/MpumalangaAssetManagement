import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectionStrategy } from '@angular/core';
import { MessageService, PrimeIcons } from 'primeng/api';
import { first } from 'rxjs/operators';
import { ConditionAssessment } from 'src/app/models/condition-assessment.model';
import { Facility } from 'src/app/models/facility.model';
import { User } from 'src/app/models/user.model';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ConditionAssessmentService } from 'src/app/services/condition-assessment/condition-assessment.service';
import { AssetregisterComponent } from '../assetregister.component';

@Component({
  standalone: false,
  selector: 'app-condition-assessment',
  templateUrl: './condition-assessment.component.html',
  styleUrls: ['./condition-assessment.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [MessageService]
})
export class ConditionAssessmentComponent implements OnInit {
  @Input() selectedFacility: Facility;
  @Input() assetComponent: AssetregisterComponent;
  @Output("closeConditionAssessment") closeConditionAssessment = new EventEmitter<any>();
  @Output() stopSort= new EventEmitter<any>();
  uploadedFiles: any[] = [];
  ewwfCount: number = 0;
  edCount: number = 0;
  elements: any[] = [
    {title: 'Building/ Structural Elements', subTitles:[
      {name:'External walls & wall finishes', identifier: 'ewwfCount'},
      {name:'External doors', identifier: 'edCount'},
      {name:'External windows', identifier: 'edCount'},
      {name:'External floors & finishes', identifier: 'effCount'},
      {name:'External ceilings & ceilings finishes', identifier: 'eccfCount'},
      {name:'Roofs', identifier: 'rCount'},
      {name:'Internal walls & wall finishes', identifier: 'iwwfCount'},
      {name:'Internal doors', identifier: 'idCount'},
      {name:'Internal floors & floor finishes', identifier: 'ifffCount'},
      {name:'Internal ceilings & ceiling finishes', identifier: 'iccfCount'},
      {name:'Handwash basin', identifier: 'hbCount'},
      {name:'Carpets', identifier: 'cCount'},
      {name:'Tiles: floor', identifier: 'tfCount'},
      {name:'Tiles: wall', identifier: 'twCount'},
      {name:'Toilets', identifier: 'tCount'},
      {name:'Gutters', identifier: 'guCount'},
      {name:'Down pipes', identifier: 'dpCount'},
      {name:'Paint: exterior', identifier: 'peCount'},
      {name:'Paint: interior', identifier: 'piCount'},
      {name:'Taps', identifier: 'tCount'},
      {name:'Bath', identifier: 'bCount'},
      {name:'Stairs', identifier: 'sCount'},
      {name:'Water storage tanks', identifier: 'wstCount'},
      {name:'Geysers', identifier: 'gCount'},
    ]},
    {title: 'Electrical Elements', 
      subTitles:[
        {name:'General lighting', identifier: 'eeglCount'},
        {name:'Power distribution', identifier: 'eepdCount'},
        {name:'Main distribution box (DB)', identifier: 'eemdbCount'},
        {name:'Lifts', identifier: 'eelCount'},
        {name:'Escalators', identifier: 'eeeCount'},
        {name:'Lift motors', identifier: 'eelmCount'},
        {name:'Generators', identifier: 'eegCount'},
        {name:'Roof fan', identifier: 'eerfCount'},
        {name:'Wiring', identifier: 'eewCount'},
        {name:'Bulbs', identifier: 'eebCount'},
        {name:'Switches', identifier: 'eegCount'},
        {name:'Backup generator', identifier: 'eebgCount'},
        {name:'Plugs', identifier: 'eepCount'},
      ]},
      {title: 'Civil Elements', 
      subTitles:[
        {name:'Sewage', identifier: 'cesCount'},
        {name:'Taps pipes', identifier: 'cetpCount'},
        {name:'Water pump/reticulation', identifier: 'cewprCount'},
        {name:'Water supply', identifier: 'cewsCount'},
        {name:'Storm water drainage', identifier: 'ceswdCount'},
        {name:'Parking/carports', identifier: 'cepcCount'},
        {name:'Drainage', identifier: 'cedCount'}
      ]},
      {title: 'Mechenical Elements', 
      subTitles:[
        {name:'Boilers', identifier: 'mebCount'},
        {name:'Centralised Air conditioning installations', identifier: 'caciCount'},
        {name:'Fresh air installations', identifier: 'faiCount'},
        {name:'Room type air conditioners', identifier: 'rtacCount'}
      ]}
  ];
  conditionAssessments: Array<ConditionAssessment> = [
    {
      id: undefined,
      facilityId: undefined,
      rates: undefined,
      createdDate: undefined,
      createdBy: undefined,
      modifiedDate: new Date(),
      modifiedBy: undefined,
      creator: {
        id: 0,
        username: undefined,
        password: undefined,
        name: undefined,
        surname: undefined,
        roleId: undefined,
        role: undefined,
        isActive: undefined,
        email: undefined,
        passwordIsChanged: undefined,
        createdDate: new Date(),
        createdUserId: undefined,
        modifiedDate: new Date(),
        modifiedUserId: undefined,
        token: undefined,
        department: undefined
      }
    }];
  public pCount: number = 0;
  public aCount: number = 0;
  public cCount: number = 0;
  public sCount: number = 0;
  public oCount: number = 0;
  public fCount: number = 0;
  loading: boolean;
  dataIsLoaded: boolean = false;
  isBusy: boolean;
  currentUser: User;
  stateOptions: any[];
  paymentOptions: any[];
  activeIndex: number = 0;
  items: any[] = [];
  mode: string = 'Edit';
  landFiles: any[] = [];
  showdelete: boolean = false;
  lcValue: any;
  cbValue: any;
  hsValue: any;
  arValue: any;
  pVvalue: any;
  sValue: any;
  tValue: any;
  ewValue: any;
  cocValue: any;
  fdValue: any;
  feValue: any;
  erValue: any;
  erisValue: any;
  bpValue: any;
  slValue: any;
  sgwValue: any;

  constructor(private authenticationService: AuthenticationService, public conditionAssessmentService: ConditionAssessmentService, private messageService: MessageService) {
    this.stateOptions = [{label: 'Available', value: 'available'}, {label: 'Not Available', value: 'notAvailable'}];

    this.paymentOptions = [
        {name: 'Bad', value: 1},
        {name: 'Fair', value: 2},
        {name: 'Good', value: 3}
    ];
   }

  ngOnInit() {
    this.authenticationService.currentUser.subscribe(x => {
      this.currentUser = x;
    });
    this.getConditionAssessment();    
  }

  getConditionAssessment() {
    this.conditionAssessmentService.getConditionAssessments(this.selectedFacility.id).pipe(first()).subscribe(conditionAssessments => {
      this.conditionAssessments = conditionAssessments;
      this.conditionAssessments.forEach(element => {
        element.displayName = element.creator.name +' ' + element.creator.surname;
        element.date = new DatePipe('en-ZA').transform(element.createdDate, 'dd MMMM yyyy');
        element.color = '#'+Math.floor(Math.random() * 16777216).toString(16);
      });
      this.dataIsLoaded = true;
    });
  }

  saveConditionAssessment() {
    this.isBusy = true;
    var conditionAssessment: ConditionAssessment = {
      id: 0,
      facilityId: this.selectedFacility.id,
      createdDate: new Date(),
      createdBy: this.currentUser.id,
      creator: this.currentUser,
      displayName: this.currentUser.name +' ' + this.currentUser.surname,
      date: new DatePipe('en-ZA').transform(new Date(), 'dd MMMM yyyy'),
      color: '#'+Math.floor(Math.random() * 16777216).toString(16),
      modifiedDate: null,
      modifiedBy: null,
      rates: [{
        value: this.pCount,
        name: "Required Performance Standard",
        key: 1
      }, {
        value: this.aCount,
        name: "Accessibility Rating",
        key: 2
      }, {
        value: this.cCount,
        name: "Condition Rating",
        key: 3
      }, {
        value: this.sCount,
        name: "Suitability Index",
        key: 4
      }, {
        value: this.oCount,
        name: "Operating Performance Index",
        key: 5
      }, {
        value: this.fCount,
        name: "Functional Performance Standard",
        key: 6
      }]
    }
   
    this.conditionAssessmentService.saveConditionAssessment(conditionAssessment).pipe(first()).subscribe(id => {
      if (id >= 0) {
        conditionAssessment.id = id;
        this.conditionAssessments.push(conditionAssessment);
        this.messageService.add({ severity: 'success', summary: 'Saving', detail: 'Condition assessment records are saved successful.' });
        this.closeConditionAssessment.emit({isChild: true});
      } else {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'An error occurred while saving!' });
      }
      this.isBusy = false;
    });
  }

  onLandRemoveFile(evt: any){
    var fileIndex = this.uploadedFiles.indexOf(evt.file)
    this.uploadedFiles.slice(-1, fileIndex);
  }

  onLandSelectFile(evt: any) {
    let uploadedFile = evt[0];
    this.uploadedFiles.push(uploadedFile);    
  }

  setRate() {
    this.sCount = 0;

    if (((this.pCount == 2 || this.pCount == 3 || this.pCount == 4 || this.pCount == 5) && this.aCount == 1) || (this.pCount == 1) || (this.aCount == 2 && (this.pCount == 5 || this.pCount == 4))) {
      this.sCount = 3;
    }

    if (((this.pCount == 3 || this.pCount == 2) && this.aCount == 2) || (this.aCount == 3 && (this.pCount == 5 || this.pCount == 4 || this.pCount == 3))) {
      this.sCount = 2;
    }

    if ((this.aCount == 3 && (this.pCount == 2)) || ((this.pCount == 2 || this.pCount == 3 || this.pCount == 4 || this.pCount == 5) && this.aCount == 4) || (this.aCount == 5 && (this.pCount == 5 || this.pCount == 4 || this.pCount == 3 || this.pCount == 2))) {
      this.sCount = 1;
    }

    if ((this.cCount == 1 && (this.pCount == 2 || this.pCount == 3 || this.pCount == 4 || this.pCount == 5) || (this.cCount == 2 && (this.pCount == 3 || this.pCount == 4 || this.pCount == 5)) || (this.cCount == 3 && (this.pCount == 5)))) {
      this.oCount = 1
    }

    if ((this.cCount == 1 && this.pCount == 1) || (this.cCount == 2 && (this.pCount == 2 || this.pCount == 1)) || (this.cCount == 3 && (this.pCount == 3 || this.pCount == 2)) || (this.cCount == 4 && this.pCount == 4)) {
      this.oCount = 2
    }

    if ((this.cCount == 3 && (this.pCount == 1 || this.pCount == 2)) || (this.cCount == 4 && (this.pCount == 1 || this.pCount == 2 || this.pCount == 3 || this.pCount == 4)) || (this.cCount == 5 && (this.pCount == 1 || this.pCount == 2 || this.pCount == 3 || this.pCount == 4 || this.pCount == 5))) {
      this.oCount = 3
    }

    if (this.sCount == 1 && this.oCount == 1) {
      this.fCount = 1;
    }

    if ((this.sCount == 1 && this.oCount == 2)) {
      this.fCount = 4;
    }

    if ((this.sCount == 1 && this.oCount == 3)) {
      this.fCount = 7;
    }

    if (this.sCount == 2 && this.oCount == 1) {
      this.fCount = 2;
    }

    if ((this.sCount == 2 && this.oCount == 2)) {
      this.fCount = 5;
    }

    if ((this.sCount == 2 && this.oCount == 3)) {
      this.fCount = 8;
    }

    if (this.sCount == 3 && this.oCount == 1) {
      this.fCount = 3;
    }

    if ((this.sCount == 3 && this.oCount == 2)) {
      this.fCount = 6;
    }

    if ((this.sCount == 3 && this.oCount == 3)) {
      this.fCount = 9;
    }
  }
}

