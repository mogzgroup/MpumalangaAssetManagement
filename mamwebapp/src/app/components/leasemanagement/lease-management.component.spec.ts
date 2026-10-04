import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LeaseManagementComponent } from './lease-management.component';

describe('ViewPropertyComponent', () => {
  let component: LeaseManagementComponent;
  let fixture: ComponentFixture<LeaseManagementComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LeaseManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LeaseManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

