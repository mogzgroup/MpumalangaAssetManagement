import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { GapAnalysis } from '../../../models/gap-analysis.model';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-gap-analysis',
    templateUrl: './gap-analysis.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./gap-analysis.component.css'],
    imports: [MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatFormField, MatInput, FormsModule, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatButton]
})
export class GapAnalysisComponent implements OnInit {
  
  gapAnalyses: GapAnalysis[] = [];
  displayedColumns = [
    'programme',
    'optimalAssets',
    'gapOptimalAssetsUtilisedAssets',
    'quantifiedNeedStatement',
    'priority'
  ];

  constructor() { 
    this.gapAnalyses.push(new GapAnalysis());
  }

  ngOnInit() {
  }

  addGapAnalysis() {
    this.gapAnalyses.push(new GapAnalysis());
  }

}
