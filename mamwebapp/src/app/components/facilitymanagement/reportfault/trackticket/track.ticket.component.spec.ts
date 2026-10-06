import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TrackTicketComponent } from './track.ticket.component';

describe('TrackTicketComponent', () => {
  let component: TrackTicketComponent;
  let fixture: ComponentFixture<TrackTicketComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [TrackTicketComponent]
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrackTicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

