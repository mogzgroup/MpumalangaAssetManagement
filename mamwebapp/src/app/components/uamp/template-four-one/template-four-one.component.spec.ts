import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TemplateFourOneComponent } from './template-four-one.component';

describe('TemplateFourOneComponent', () => {
  let component: TemplateFourOneComponent;
  let fixture: ComponentFixture<TemplateFourOneComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TemplateFourOneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateFourOneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
