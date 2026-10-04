import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AssetregisterComponent } from './assetregister.component';

describe('AssetregisterComponent', () => {
  let component: AssetregisterComponent;
  let fixture: ComponentFixture<AssetregisterComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetregisterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetregisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

