import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TemplateThreeComponent } from './template-three.component';

describe('TemplateThreeComponent', () => {
  let component: TemplateThreeComponent;
  let fixture: ComponentFixture<TemplateThreeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TemplateThreeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateThreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
