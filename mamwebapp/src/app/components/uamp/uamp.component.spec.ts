import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UampComponent } from './uamp.component';

describe('UampComponent', () => {
  let component: UampComponent;
  let fixture: ComponentFixture<UampComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [UampComponent]
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UampComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

