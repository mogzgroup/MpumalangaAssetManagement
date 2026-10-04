import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TemplateFiveThreeComponent } from './template-five-three.component';

describe('TemplateFiveThreeComponent', () => {
  let component: TemplateFiveThreeComponent;
  let fixture: ComponentFixture<TemplateFiveThreeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TemplateFiveThreeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => { 
    fixture = TestBed.createComponent(TemplateFiveThreeComponent);
    component = fixture.componentInstance; 
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
