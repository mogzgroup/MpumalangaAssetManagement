import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CampComponent } from './camp.component';

describe('CAMPComponent', () => {
  let component: CampComponent;
  let fixture: ComponentFixture<CampComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [CampComponent]
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CampComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

