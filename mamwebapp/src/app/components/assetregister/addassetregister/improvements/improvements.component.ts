import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-improvements',
  templateUrl: './improvements.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./improvements.component.css']
})
export class ImprovementsComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
