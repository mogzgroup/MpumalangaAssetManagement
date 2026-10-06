import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { ImprovementsComponent } from './improvements.component';

describe('ImprovementsComponent', () => {
  let component: ImprovementsComponent;
  let fixture: ComponentFixture<ImprovementsComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
    imports: [CommonModule, MatCardModule, MatIconModule, ImprovementsComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImprovementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
