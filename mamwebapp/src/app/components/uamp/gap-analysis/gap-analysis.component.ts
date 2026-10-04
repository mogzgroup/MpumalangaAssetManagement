import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { GapAnalysis } from '../../../models/gap-analysis.model';

@Component({
  standalone: false,
  selector: 'app-gap-analysis',
  templateUrl: './gap-analysis.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./gap-analysis.component.css']
})
export class GapAnalysisComponent implements OnInit {
  
  gapAnalyses: GapAnalysis[] = [];

  constructor() { 
    this.gapAnalyses.push(new GapAnalysis());
  }

  ngOnInit() {
  }

  addGapAnalysis() {
    this.gapAnalyses.push(new GapAnalysis());
  }

}
