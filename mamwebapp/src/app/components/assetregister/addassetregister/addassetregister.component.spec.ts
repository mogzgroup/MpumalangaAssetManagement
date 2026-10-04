import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddassetregisterComponent } from './addassetregister.component';

describe('AddassetregisterComponent', () => {
  let component: AddassetregisterComponent;
  let fixture: ComponentFixture<AddassetregisterComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddassetregisterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddassetregisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
