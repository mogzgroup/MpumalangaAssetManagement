import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  standalone: false,
  selector: 'app-leaseregister',
  templateUrl: './leaseregister.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./leaseregister.component.css']
})
export class LeaseRegisterComponent implements OnInit {
  items: MenuItem[];

  constructor() { }

  ngOnInit() {
    this.items = [{ icon: 'pi pi-home', url: 'dashboard' },
    { label: 'Hiring' }];
  }

}

