import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TemplateSevenComponent } from './template-seven.component';

describe('TemplateSevenComponent', () => {
  let component: TemplateSevenComponent;
  let fixture: ComponentFixture<TemplateSevenComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TemplateSevenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateSevenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

