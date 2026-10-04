import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TemplateFiveTwoComponent } from './template-five-two.component';

describe('TemplateFiveTwoComponent', () => {
  let component: TemplateFiveTwoComponent;
  let fixture: ComponentFixture<TemplateFiveTwoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TemplateFiveTwoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateFiveTwoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy(); 
  });
});
