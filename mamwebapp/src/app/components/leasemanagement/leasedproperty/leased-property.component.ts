import { DatePipe } from '@angular/common';
import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { first } from 'rxjs/operators';
import { LeasedProperty } from 'src/app/models/leased-property.model';
import { LeasedPropertiesService } from 'src/app/services/leased-property/leased-property.service';

@Component({
  standalone: false,
  selector: 'app-leased-property',
  templateUrl: './leased-property.component.html',
  styleUrls: ['./leased-property.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [MessageService, ConfirmationService]
})
export class LeasedPropertyComponent implements OnInit {
    activeIndex: number = 0;
  landFiles: any[] = [];
    @Input() selectedLeasedProperty: any;
    constructor(private leasedPropertiesService: LeasedPropertiesService) { }

    ngOnInit() {

    }

    onLandRemoveFile(e){
        
    }

    onLandSelectFile(e){

    }
}
