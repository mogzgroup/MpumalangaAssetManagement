import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

import { MatOption } from '@angular/material/autocomplete';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-financials',
    templateUrl: './financials.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./financials.component.css'],
    imports: [MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardContent, MatFormField, MatLabel, MatSelect, FormsModule, MatOption, MatCardActions, MatButton, MatIcon]
})
export class FinancialsComponent implements OnInit {
  private router = inject(Router);

  classes: any[];

    vagons: any[] = [];
    
    seats: any[] = [];

    seatInformation: any = { class: null, wagon: null, seat: null };

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
