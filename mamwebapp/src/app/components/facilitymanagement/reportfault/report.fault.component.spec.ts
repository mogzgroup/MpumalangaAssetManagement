import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ReportFaultComponent } from './report.fault.component';

describe('ReportFaultComponent', () => {
  let component: ReportFaultComponent;
  let fixture: ComponentFixture<ReportFaultComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportFaultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportFaultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
