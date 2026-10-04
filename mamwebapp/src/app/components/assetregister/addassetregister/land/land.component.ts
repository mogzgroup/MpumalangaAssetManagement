import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-land',
  templateUrl: './land.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./land.component.css']
})
export class LandComponent implements OnInit {

  personalInformation: any;

    submitted: boolean = false;

    constructor( private router: Router) { }

    ngOnInit() { 
        //this.personalInformation = this.ticketService.getTicketInformation().personalInformation;
    }

    nextPage() {
        if (this.personalInformation.firstname && this.personalInformation.lastname && this.personalInformation.age) {
           // this.ticketService.ticketInformation.personalInformation = this.personalInformation;
            this.router.navigate(['steps/seat']);

            return;
        }

        this.submitted = true;
    }

}
