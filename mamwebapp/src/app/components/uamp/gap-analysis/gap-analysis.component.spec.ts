import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GapAnalysisComponent } from './gap-analysis.component';

describe('GapAnalysisComponent', () => {
  let component: GapAnalysisComponent;
  let fixture: ComponentFixture<GapAnalysisComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GapAnalysisComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GapAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
