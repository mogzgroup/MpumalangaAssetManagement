import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TemplateFourTwoComponent } from './template-four-two.component';

describe('TemplateFourTwoComponent', () => {
  let component: TemplateFourTwoComponent;
  let fixture: ComponentFixture<TemplateFourTwoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TemplateFourTwoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateFourTwoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
