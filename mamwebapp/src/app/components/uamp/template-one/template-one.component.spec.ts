import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TemplateOneComponent } from './template-one.component';

describe('TemplateOneComponent', () => {
  let component: TemplateOneComponent;
  let fixture: ComponentFixture<TemplateOneComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TemplateOneComponent ]
    })
    .compileComponents();
  })); 

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateOneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
