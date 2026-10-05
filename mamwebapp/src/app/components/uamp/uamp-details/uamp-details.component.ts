import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { UAMP } from 'src/app/models/uamp.model';

@Component({
  standalone: false,
  selector: 'app-uamp-details',
  templateUrl: './uamp-details.component.html',
  styleUrls: ['./uamp-details.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class UampDetailsComponent implements OnInit {
  templates: { label: string; routerLink: string }[];
  @Input() uamp: UAMP;

  constructor() { }

  ngOnInit() {
    this.templates = [{
      label: 'Template 1',
      routerLink: 'uampTemp1'
    },
    {
      label: 'Template 2.1',
      routerLink: 'uampTemp21'
    },
    {
      label: 'Template 2.2',
      routerLink: 'uampTemp22'
    },
    {
      label: 'Template 3',
      routerLink: 'uampTemp3'
    },
    {
      label: 'Template 4.1',
      routerLink: 'uampTemp41'
    },
    {
      label: 'Template 4.2',
      routerLink: 'uampTemp42'
    },
    {
      label: 'Template 5.1',
      routerLink: 'uampTemp51'
    },
    {
      label: 'Template 5.2',
      routerLink: 'uampTemp52'
    },
    {
      label: 'Template 5.3',
      routerLink: 'uampTemp53'
    },
    {
      label: 'Template 6',
      routerLink: 'uampTemp6'
    },
    {
      label: 'Template 7',
      routerLink: 'uampTemp7'
    }
    ];
  }
}
