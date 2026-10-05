import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectionStrategy } from '@angular/core';
import { first } from 'rxjs/operators';
import { ConditionAssessment } from 'src/app/models/condition-assessment.model';
import { Facility } from 'src/app/models/facility.model';
import { User } from 'src/app/models/user.model';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ConditionAssessmentService } from 'src/app/services/condition-assessment/condition-assessment.service';
import { AssetregisterComponent } from '../assetregister.component';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  standalone: false,
  selector: 'app-condition-assessment',
  templateUrl: './condition-assessment.component.html',
  styleUrls: ['./condition-assessment.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager
})
export class ConditionAssessmentComponent implements OnInit {
  @Input() selectedFacility: Facility;
  @Input() assetComponent: AssetregisterComponent;
  @Output("closeConditionAssessment") closeConditionAssessment = new EventEmitter<any>();
  @Output() stopSort= new EventEmitter<any>();
  uploadedFiles: File[] = [];
  landFiles: { name: string; url: string; file: File }[] = [];
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
  performanceRatings = [
    { value: 1, label: 'P1', description: 'Functions have ceased or accommodation is dormant; only minimal maintenance is required.' },
    { value: 2, label: 'P2', description: 'Accommodation provides essential support only or has a limited remaining life.' },
    { value: 3, label: 'P3', description: 'Functionally focused accommodation at utility level, such as a school.' },
    { value: 4, label: 'P4', description: 'Business operations require good public presentation and a high-quality working environment.' },
    { value: 5, label: 'P5', description: 'Highly sensitive or high-profile functions require the best possible accommodation condition.' }
  ];
  accessibilityRatings = [
    { value: 1, label: 'A1', description: 'Location does not meet service delivery objectives and is not accessible to the public.' },
    { value: 2, label: 'A2', description: 'Location limits service delivery and public or physical accessibility.' },
    { value: 3, label: 'A3', description: 'Location partially supports service delivery and has limited accessibility.' },
    { value: 4, label: 'A4', description: 'Location fully supports service delivery and is accessible to the public.' },
    { value: 5, label: 'A5', description: 'Location and accommodation fully support service delivery and accessibility.' }
  ];
  conditionRatings = [
    { value: 1, label: 'C1', description: 'Very poor condition.' },
    { value: 2, label: 'C2', description: 'Poor condition.' },
    { value: 3, label: 'C3', description: 'Fair condition.' },
    { value: 4, label: 'C4', description: 'Good condition.' },
    { value: 5, label: 'C5', description: 'Excellent condition.' }
  ];
  technicalRatingLabels = ['Very poor', 'Poor', 'Fair', 'Good', 'Excellent'];
  accessibilityChecks: { label: string; key: string }[] = [
    { label: 'Lifts compliant to use by disabled', key: 'pVvalue' },
    { label: 'Parking for disabled', key: 'arValue' },
    { label: 'Signage for disabled', key: 'sValue' },
    { label: 'Toilet(s) for people with disabilities', key: 'tValue' },
    { label: 'Escape wheelchair', key: 'ewValue' }
  ];
  safetyChecks: { label: string; key: string }[] = [
    { label: 'Certificate of Compliance COC', key: 'cocValue' },
    { label: 'Security lights', key: 'slValue' },
    { label: 'Security fence or wall', key: 'sgwValue' },
    { label: 'Fire detectors', key: 'fdValue' },
    { label: 'Fire extinguishers', key: 'feValue' },
    { label: 'Escape route', key: 'erValue' },
    { label: 'Escape route indicators/signage', key: 'erisValue' },
    { label: 'Burglar proofs (doors and windows)', key: 'bpValue' }
  ];
  activeIndex: number = 0;
  items: any[] = [];
  mode: string = 'Edit';
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

  constructor(private authenticationService: AuthenticationService, public conditionAssessmentService: ConditionAssessmentService, private toastService: ToastService) {
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
        this.toastService.showSuccess('Condition assessment records were saved successfully.');
        this.closeConditionAssessment.emit({isChild: true});
      } else {
        this.toastService.showError('An error occurred while saving the condition assessment.');
      }
      this.isBusy = false;
    });
  }

  onLandRemoveFile(file: { file: File; url: string }) {
    const index = this.uploadedFiles.indexOf(file.file);
    if (index >= 0) {
      this.uploadedFiles.splice(index, 1);
    }
    this.landFiles = this.landFiles.filter(item => item.file !== file.file);
    URL.revokeObjectURL(file.url);
  }

  onLandSelectFile(files: FileList | File[]) {
    Array.from(files).forEach(file => {
      if (!this.uploadedFiles.includes(file)) {
        this.uploadedFiles.push(file);
        this.landFiles.push({ name: file.name, url: URL.createObjectURL(file), file });
      }
    });
  }

  getCheckValue(key: string): string | undefined {
    switch (key) {
      case 'pVvalue': return this.pVvalue;
      case 'arValue': return this.arValue;
      case 'sValue': return this.sValue;
      case 'tValue': return this.tValue;
      case 'ewValue': return this.ewValue;
      case 'cocValue': return this.cocValue;
      case 'slValue': return this.slValue;
      case 'sgwValue': return this.sgwValue;
      case 'fdValue': return this.fdValue;
      case 'feValue': return this.feValue;
      case 'erValue': return this.erValue;
      case 'erisValue': return this.erisValue;
      case 'bpValue': return this.bpValue;
      default: return undefined;
    }
  }

  setCheckValue(key: string, value: string) {
    switch (key) {
      case 'pVvalue': this.pVvalue = value; break;
      case 'arValue': this.arValue = value; break;
      case 'sValue': this.sValue = value; break;
      case 'tValue': this.tValue = value; break;
      case 'ewValue': this.ewValue = value; break;
      case 'cocValue': this.cocValue = value; break;
      case 'slValue': this.slValue = value; break;
      case 'sgwValue': this.sgwValue = value; break;
      case 'fdValue': this.fdValue = value; break;
      case 'feValue': this.feValue = value; break;
      case 'erValue': this.erValue = value; break;
      case 'erisValue': this.erisValue = value; break;
      case 'bpValue': this.bpValue = value; break;
    }
  }

  ratingDisplayCount(rate: { key: number }): number {
    return rate.key === 6 ? 9 : rate.key === 4 || rate.key === 5 ? 5 : 3;
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
