import { DatePipe, CurrencyPipe } from '@angular/common';
import { Component, Input, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { LeasedPropertiesService } from 'src/app/services/leased-property/leased-property.service';
import { MatTabGroup, MatTab } from '@angular/material/tabs';

@Component({
    selector: 'app-leased-property',
    templateUrl: './leased-property.component.html',
    styleUrls: ['./leased-property.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatTabGroup, MatTab, CurrencyPipe, DatePipe]
})
export class LeasedPropertyComponent implements OnInit {
    private leasedPropertiesService = inject(LeasedPropertiesService);

    activeIndex = 0;
  landFiles: any[] = [];
    @Input() selectedLeasedProperty: any;

    ngOnInit() {

    }

    onLandRemoveFile(e){
        
    }

    onLandSelectFile(e){

    }
}
