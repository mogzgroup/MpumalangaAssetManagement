import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TemplateSixComponent } from './template-six.component';

describe('TemplateSixComponent', () => {
  let component: TemplateSixComponent;
  let fixture: ComponentFixture<TemplateSixComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [TemplateSixComponent]
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateSixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

