import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddEditProjectComponent } from './add-edit-project.component';

describe('AddEditProjectComponent', () => {
  let component: AddEditProjectComponent;
  let fixture: ComponentFixture<AddEditProjectComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditProjectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
