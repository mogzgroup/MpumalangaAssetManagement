import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FacilityManagementComponent } from './facility-management.component';

describe('ViewPropertyComponent', () => {
  let component: FacilityManagementComponent;
  let fixture: ComponentFixture<FacilityManagementComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [FacilityManagementComponent]
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FacilityManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

