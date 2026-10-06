import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-land',
    templateUrl: './land.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./land.component.css'],
    imports: [MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardContent, MatFormField, MatLabel, MatInput, FormsModule, MatError, MatCardActions, MatButton, MatIcon]
})
export class LandComponent implements OnInit {
  private router = inject(Router);


  personalInformation: any = { firstname: '', lastname: '', age: null };

    submitted = false;

    ngOnInit() { 
    }

    nextPage() {
        if (this.personalInformation.firstname && this.personalInformation.lastname && this.personalInformation.age) {
            this.router.navigate(['steps/seat']);

            return;
        }

        this.submitted = true;
    }

}
