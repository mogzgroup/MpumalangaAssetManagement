import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { StrategicAssessment } from 'src/app/models/strategic-assessment.model';
import { UAMP } from 'src/app/models/uamp.model';

@Component({
  standalone: false,
  selector: 'app-uamp-details',
  templateUrl: './uamp-details.component.html',
  styles: [`
        :host /deep/ .ui-steps .ui-steps-item {
            width: 20%;
        }
    `],
  styleUrls: ['./uamp-details.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [MessageService],
})
export class UampDetailsComponent implements OnInit {
  templates: MenuItem[];
  subscription: Subscription;
  @Input() uamp: UAMP;
  activeIndex: 1;

  constructor(public messageService: MessageService) { }

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
