import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardContent } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-improvements',
    templateUrl: './improvements.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./improvements.component.css'],
    imports: [MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardContent, MatIcon]
})
export class ImprovementsComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}

