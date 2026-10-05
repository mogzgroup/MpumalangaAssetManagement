import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-leaseregister',
  templateUrl: './leaseregister.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./leaseregister.component.css']
})
export class LeaseRegisterComponent implements OnInit {
  constructor() { }

  ngOnInit() {
  }

}
