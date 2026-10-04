import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-financials',
  templateUrl: './financials.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./financials.component.css']
})
export class FinancialsComponent implements OnInit {

  constructor(private router: Router) { }
  classes: any[];

    vagons: any[];
    
    seats: any[];

    seatInformation: any;

    ngOnInit() { 

        this.classes = [
            {name: 'First Class', code: 'A', factor: 1},
            {name: 'Second Class', code: 'B', factor: 2},
            {name: 'Third Class', code: 'C', factor: 3}
        ];    
    }

    setVagons(event) {
        if (this.seatInformation.class && event.value) {
            this.vagons = [];
            this.seats = [];
            for (let i = 1; i < 3 * event.value.factor; i++) {
                this.vagons.push({wagon: i + event.value.code, type: event.value.name, factor: event.value.factor});
            }
        }
    }
    
    setSeats(event) {
        if (this.seatInformation.wagon && event.value) {
            this.seats = [];
            for (let i = 1; i < 10 * event.value.factor; i++) {
                this.seats.push({seat: i, type: event.value.type});
            }
        }
    }

    nextPage() {
        if (this.seatInformation.class && this.seatInformation.seat && this.seatInformation.wagon) {
            this.router.navigate(['steps/payment']);
        }
    }

    prevPage() {
        this.router.navigate(['steps/personal']);
    }

}

