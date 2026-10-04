import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddFaultComponent } from './add.fault.component';

describe('AddFaultComponent', () => {
  let component: AddFaultComponent;
  let fixture: ComponentFixture<AddFaultComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddFaultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddFaultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

