import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ConditionAssessmentComponent } from './condition-assessment.component';

describe('ViewPropertyComponent', () => {
  let component: ConditionAssessmentComponent;
  let fixture: ComponentFixture<ConditionAssessmentComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ConditionAssessmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConditionAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
