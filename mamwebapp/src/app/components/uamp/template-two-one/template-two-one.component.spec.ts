import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TemplateTwoOneComponent } from './template-two-one.component';

describe('TemplateTwoComponent', () => {
  let component: TemplateTwoOneComponent;
  let fixture: ComponentFixture<TemplateTwoOneComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TemplateTwoOneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateTwoOneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy(); 
  });
});
