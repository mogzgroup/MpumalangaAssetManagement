import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LeasedPropertyComponent } from './leased-property.component';

describe('ViewPropertyComponent', () => {
  let component: LeasedPropertyComponent;
  let fixture: ComponentFixture<LeasedPropertyComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [LeasedPropertyComponent]
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LeasedPropertyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

