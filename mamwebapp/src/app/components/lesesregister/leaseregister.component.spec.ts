import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LeaseRegisterComponent } from './leaseregister.component';

describe('LeaseRegisterComponent', () => {
  let component: LeaseRegisterComponent;
  let fixture: ComponentFixture<LeaseRegisterComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LeaseRegisterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LeaseRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

