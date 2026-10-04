import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./add-user.component.css']
})
export class AddUserComponent implements OnInit {
  roles: any[];
  constructor() { }

  ngOnInit() {

    this.roles = [
      { name: 'Administrator', code: 'SA', factor: 1 },
      { name: 'Approver', code: 'A', factor: 3 },
      { name: 'Capturer', code: 'C', factor: 2 },
      { name: 'Manager', code: 'M', factor: 5 },
      { name: 'Verifier', code: 'DV', factor: 4 },
      { name: 'Viewer', code: 'V', factor: 6 },
    ];
  }

}
