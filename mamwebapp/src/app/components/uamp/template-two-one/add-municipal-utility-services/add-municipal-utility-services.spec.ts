import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddMunicipalUtilityServicesComponent } from './add-municipal-utility-services';

describe('TemplateTwoComponent', () => {
  let component: AddMunicipalUtilityServicesComponent;
  let fixture: ComponentFixture<AddMunicipalUtilityServicesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddMunicipalUtilityServicesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => { 
    fixture = TestBed.createComponent(AddMunicipalUtilityServicesComponent);
    component = fixture.componentInstance; 
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

