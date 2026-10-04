import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PrintAssetComponent } from './print-asset.component';

describe('ViewPropertyComponent', () => {
  let component: PrintAssetComponent;
  let fixture: ComponentFixture<PrintAssetComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PrintAssetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintAssetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

