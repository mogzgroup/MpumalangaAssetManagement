import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UampDetailsComponent } from './uamp-details.component';

describe('ViewUampComponent', () => {
  let component: UampDetailsComponent;
  let fixture: ComponentFixture<UampDetailsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UampDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UampDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
