import { Injectable } from '@angular/core';
import { LeasedProperty } from '../models/leased-property.model';
import { MtefBudgetPeriod } from '../models/mtef-budget-period.model';
import { UAMP } from '../models/uamp.model';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  constructor() { }

  getDepartmentCode(department: string): string {
    let code = '';
    switch (department) {
      case 'Agriculture, rural development, land & environmental affairs':
        code = 'ARALEA';
        break;
      case 'Economic development & tourism':
        code = 'EDT';
        break;
      case 'Co-operative governance & traditional affairs':
        code = 'EDT';
        break;
      case 'Co-operative governance & traditional affairs':
        code = 'CGTA';
        break;
      case 'Community safety, security & liason':
        code = 'CSSL';
        break;
      case 'Culture, sport & recreation':
        code = 'CSR';
        break;
      case 'Education':
        code = 'E';
        break;
      case 'Provincial treasury':
        code = 'PT';
        break;
      case 'Health':
        code = 'H';
        break;
      case 'Human settlements':
        code = 'HS';
        break;
      case 'Social development':
        code = 'SD';
        break;
      case 'Public works, roads & transport':
        code = 'PWRT';
        break;
    }
    return code;
  }

  getRandomString(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  getRandomNumber(length): number {
    let result;
    const characters = '0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  getLocalMunicipalitiesByName(value) {
    let localMunicipalities = [];
    switch (value) {
      case 'Ehlanzeni': localMunicipalities = [
        { name: 'Bushbuckridge', code: 'B', factor: 1 },
        { name: 'Mbombela', code: 'M', factor: 2 },
        { name: 'Nkomazi', code: 'N', factor: 3 },
        { name: 'Thaba Chweu', code: 'TC', factor: 4 },
      ];
        break;
      case 'Gert Sibande': localMunicipalities = [
        { name: 'Albert Luthuli', code: 'AL', factor: 1 },
        { name: 'Dipaleseng', code: 'D', factor: 2 },
        { name: 'Govan Mbeki', code: 'GM', factor: 3 },
        { name: 'Lekwa', code: 'L', factor: 7 },
        { name: 'Mkhondo', code: 'M', factor: 4 },
        { name: 'Msukaligwa', code: 'MS', factor: 5 },
        { name: 'Mkhondo', code: 'MK', factor: 6 },
        { name: 'Pixley Ka Seme', code: 'PKS', factor: 8 },
      ];
        break;
      case 'Nkangala': localMunicipalities = [
        { name: 'Dr. J.S. Moroka', code: 'JSM', factor: 1 },
        { name: 'eMalahleni', code: 'M', factor: 2 },
        { name: 'eMakhazeni', code: 'MK', factor: 3 },
        { name: 'Msukaligwa', code: 'MS', factor: 4 },
        { name: 'Steve Tshwete', code: 'ST', factor: 5 },
        { name: 'Thembisile Hani', code: 'TH', factor: 6 },
        { name: 'Victor Khanye', code: 'VK', factor: 7 },
      ];
    }
    return localMunicipalities;
  }

  getDistricts() {
    return [
      { name: 'Ehlanzeni', code: 'E', factor: 1 },
      { name: 'Gert Sibande', code: 'G', factor: 2 },
      { name: 'Nkangala', code: 'N', factor: 3 },
      { name: 'Bohlabela', code: 'B', factor: 4 }
    ];
  }

  getHiringPropertyStatuses() {
    return [
      { name: 'Good Standing', code: 'GS', factor: 1 },
      { name: 'Month to Month', code: 'MM', factor: 2 }
    ];
  }

  getDepartments() {
    return [
      { name: 'Agriculture, rural development, land & environmental affairs', code: 'ARALEA', factor: 1 },
      { name: 'Economic development & tourism', code: 'EDT', factor: 2 },
      { name: 'Co-operative governance & traditional affairs', code: 'CGTA', factor: 3 },
      { name: 'Community safety, security & liason', code: 'CSSL', factor: 4 },
      { name: 'Culture, sport & recreation', code: 'CSR', factor: 5 },
      { name: 'Education', code: 'E', factor: 6 },
      { name: 'Provincial treasury', code: 'PT', factor: 7 },
      { name: 'Health', code: 'H', factor: 8 },
      { name: 'Human settlements', code: 'HS', factor: 9 },
      { name: 'Social development', code: 'SD', factor: 10 },
      { name: 'Public works, roads & transport', code: 'PWRT', factor: 11 },
    ];
  }

  getLocalMunicipalityByName(value) {
    const localMunicipalities = [
      { name: 'Bushbuckridge', code: 'B', factor: 1 },
      { name: 'Mbombela', code: 'M', factor: 2 },
      { name: 'Nkomazi', code: 'N', factor: 3 },
      { name: 'Thaba Chweu', code: 'TC', factor: 4 },
      { name: 'Albert Luthuli', code: 'AL', factor: 1 },
      { name: 'Dipaleseng', code: 'D', factor: 2 },
      { name: 'Govan Mbeki', code: 'GM', factor: 3 },
      { name: 'Lekwa', code: 'L', factor: 7 },
      { name: 'Mkhondo', code: 'M', factor: 4 },
      { name: 'Msukaligwa', code: 'MS', factor: 5 },
      { name: 'Mkhondo', code: 'MK', factor: 6 },
      { name: 'Pixley Ka Seme', code: 'PKS', factor: 8 },
      { name: 'Dr. J.S. Moroka', code: 'JSM', factor: 1 },
      { name: 'eMalahleni', code: 'M', factor: 2 },
      { name: 'eMakhazeni', code: 'MK', factor: 3 },
      { name: 'Msukaligwa', code: 'MS', factor: 4 },
      { name: 'Steve Tshwete', code: 'ST', factor: 5 },
      { name: 'Thembisile Hani', code: 'TH', factor: 6 },
      { name: 'Victor Khanye', code: 'VK', factor: 7 },
      { name: 'Bushbuckridge', code: 'B', factor: 1 },
      { name: 'Thaba Chweu', code: 'TC', factor: 2 },
    ];
    return localMunicipalities.filter(l => l.name === value)[0];
  }

  getLocalMunicipalities(value) {
    let localMunicipalities = [];
    switch (value) {
      case 1: localMunicipalities = [
        { name: 'Bushbuckridge', code: 'B', factor: 1 },
        { name: 'Mbombela', code: 'M', factor: 2 },
        { name: 'Nkomazi', code: 'N', factor: 3 },
        { name: 'Thaba Chweu', code: 'TC', factor: 4 },
      ];
        break;
      case 2: localMunicipalities = [
        { name: 'Albert Luthuli', code: 'AL', factor: 1 },
        { name: 'Dipaleseng', code: 'D', factor: 2 },
        { name: 'Govan Mbeki', code: 'GM', factor: 3 },
        { name: 'Lekwa', code: 'L', factor: 7 },
        { name: 'Mkhondo', code: 'M', factor: 4 },
        { name: 'Msukaligwa', code: 'MS', factor: 5 },
        { name: 'Mkhondo', code: 'MK', factor: 6 },
        { name: 'Pixley Ka Seme', code: 'PKS', factor: 8 },
      ];
        break;
      case 3: localMunicipalities = [
        { name: 'Dr. J.S. Moroka', code: 'JSM', factor: 1 },
        { name: 'eMalahleni', code: 'M', factor: 2 },
        { name: 'eMakhazeni', code: 'MK', factor: 3 },
        { name: 'Msukaligwa', code: 'MS', factor: 4 },
        { name: 'Steve Tshwete', code: 'ST', factor: 5 },
        { name: 'Thembisile Hani', code: 'TH', factor: 6 },
        { name: 'Victor Khanye', code: 'VK', factor: 7 },
      ];
        break;
      default:
        localMunicipalities = [
          { name: 'Bushbuckridge', code: 'B', factor: 1 },
          { name: 'Thaba Chweu', code: 'TC', factor: 2 },
        ];
    }
    return localMunicipalities;
  }

  getPropertyTypes() {
    return [
      { name: 'Agricultural Holding', code: 'A', factor: 1 },
      { name: 'Clinic', code: 'A', factor: 2 },
      { name: 'Erf', code: 'E', factor: 3 },
      { name: 'Farm', code: 'F', factor: 4 },
      { name: 'Office', code: 'O', factor: 5 },
      { name: 'Residential', code: 'Res', factor: 6 },
      { name: 'Retail', code: 'R', factor: 7 },
      { name: 'Sectional Title', code: 'S', factor: 8 },
      { name: 'Warehouse', code: 'warehouse', factor: 9 },
      { name: 'Other', code: 'Other', factor: 10 }
    ];
  }

  getInitialNeedYears() {
    const initialNeedYears = [
      { name: '2005', code: '5', factor: 1 },
      { name: '2006', code: '6', factor: 2 },
      { name: '2007', code: '7', factor: 3 },
      { name: '2008', code: '8', factor: 4 },
      { name: '2009', code: '9', factor: 5 },
      { name: '2010', code: '10', factor: 6 },
      { name: '2011', code: '11', factor: 7 },
      { name: '2012', code: '12', factor: 8 },
      { name: '2013', code: '13', factor: 9 },
      { name: '2014', code: '14', factor: 10 },
      { name: '2015', code: '15', factor: 11 },
      { name: '2016', code: '16', factor: 12 },
      { name: '2017', code: '17', factor: 13 },
      { name: '2018', code: '18', factor: 14 },
      { name: '2019', code: '19', factor: 15 },
      { name: '2020', code: '20', factor: 16 },
      { name: '2021', code: '21', factor: 17 },
    ];
    return initialNeedYears;
  }

  getRegions() {
    const regions = [
      { name: 'Ehlanzeni ', code: 'U', factor: 1 },
      { name: 'Gert Sibande', code: 'R', factor: 2 },
      { name: 'Nkangala', code: 'U', factor: 3 }
    ];
    return regions;
  }

  getRegionByName(name) {
    const regions = [
      { name: 'Ehlanzeni ', code: 'U', factor: 1 },
      { name: 'Gert Sibande', code: 'R', factor: 2 },
      { name: 'Nkangala', code: 'U', factor: 3 }
    ];
    return regions.filter(r => r.name === name)[0];
  }

  getPrioities() {
    const prioities = [
      { name: 'Extremely Critical 1', code: 'C1', factor: 1 },
      { name: '2', code: 'C2', factor: 2 },
      { name: '3', code: 'C3', factor: 3 },
      { name: '4', code: 'C4', factor: 4 },
      { name: '5', code: 'C5', factor: 5 },
      { name: '6', code: 'C2', factor: 6 },
      { name: '7', code: 'C3', factor: 7 },
      { name: '8', code: 'C4', factor: 8 },
      { name: '9', code: 'C5', factor: 9 },
      { name: 'Defer 10', code: 'C5', factor: 10 },
    ];

    return prioities;
  }

  getLeaseTypes() {
    const leaseTypes = [
      { name: 'Land', code: 'L', factor: 1 },
      { name: 'Office', code: 'O', factor: 2 },
      { name: 'Residential', code: 'R', factor: 3 },
      { name: 'Packing', code: 'P', factor: 4 },
    ];

    return leaseTypes;
  }

  getAssetTypes() {
    const assetTypes = [
      { name: 'Agricultural Holding', code: 'A', factor: 3 },
      { name: 'Business', code: 'E', factor: 1 },
      { name: 'Closed School', code: 'E', factor: 1 },
      { name: 'Clinic', code: 'E', factor: 1 },
      { name: 'Day Care Centre', code: 'E', factor: 1 },
      { name: 'Erf', code: 'E', factor: 1 },
      { name: 'Faclities', code: 'E', factor: 1 },
      { name: 'Farm', code: 'F', factor: 2 },
      { name: 'Government Garage', code: 'E', factor: 1 },
      { name: 'Hospital', code: 'E', factor: 1 },
      { name: 'House', code: 'E', factor: 1 },
      { name: 'Impounding', code: 'E', factor: 1 },
      { name: 'Library', code: 'E', factor: 1 },
      { name: 'Museum', code: 'E', factor: 1 },
      { name: 'Office', code: 'E', factor: 1 },
      { name: 'Offices & Road Camp ', code: 'E', factor: 1 },
      { name: 'Reapeter Station', code: 'E', factor: 1 },
      { name: 'Research Centre', code: 'E', factor: 1 },
      { name: 'Road', code: 'E', factor: 1 },
      { name: 'Road Camp', code: 'E', factor: 1 },
      { name: 'Road Reserve', code: 'E', factor: 1 },
      { name: 'Sectional Title', code: 'S', factor: 4 },
      { name: 'School', code: 'E', factor: 1 },
      { name: 'Storage', code: 'E', factor: 1 },
      { name: 'Various Facilities', code: 'E', factor: 1 },
      { name: 'Workhop', code: 'E', factor: 1 },
      { name: 'Wheighbridge', code: 'E', factor: 1 },
    ];
    return assetTypes;
  }

  getOperationTypes() {
    const operationTypes = [
      { name: 'Purchase ', code: 'P', factor: 1 },
      { name: 'Construction', code: 'C', factor: 2 }
    ];
    return operationTypes;
  }

  getStatuses() {
    const statuses = [
      { name: 'Planning ', code: 'PL', factor: 1 },
      { name: 'Procurement', code: 'PR', factor: 2 },
      { name: 'Construction', code: 'CO', factor: 3 }
    ];
    return statuses;
  }

  getAcquisitionTypes() {
    const acquisitionTypes = [
      { name: 'Construction', code: 'C', factor: 1 },
      { name: 'Donation', code: 'D', factor: 2 },
      {
        name: 'Purchase ', code: 'P', factor: 3
      }
    ];
    return acquisitionTypes;
  }

  getMunicipalUtilityServices() {
    const municipalUtilityServices = [
      { name: 'Electricity', code: 'E', factor: 1 },
      { name: 'Water', code: 'W', factor: 2 },
      { name: 'Sewer & Refuse', code: 'SR', factor: 3 }];
    return municipalUtilityServices;
  }

  getOperationalCosts() {
    const operationalCosts = [
      { name: 'Security', code: 'S', factor: 1 },
      { name: 'Telephone', code: 'T', factor: 2 },
      { name: 'Gardening', code: 'G', factor: 3 },
      { name: 'Cleaning', code: 'C', factor: 4 }
    ];
    return operationalCosts;
  }

  getConditionRatings() {
    const conditionRatings = [
      { name: 'C1 (Excellent)', code: 'Excellent', factor: 1 },
      { name: 'C2 (Good)', code: 'Good', factor: 2 },
      { name: 'C3 (Fair)', code: 'Fair', factor: 3 },
      { name: 'C4 (Poor)', code: 'Poor', factor: 4 },
      { name: 'C5 (Very Poor)', code: 'Very poor', factor: 5 },
    ];

    return conditionRatings;
  }

  getFunctionalPerformanceIndexs() {
    const functionalPerformanceIndexs = [
      { name: 'B1', code: 'B1', factor: 1 },
      { name: 'B2', code: 'B2', factor: 2 },
      { name: 'B3', code: 'B3', factor: 3 }
    ];
    return functionalPerformanceIndexs;
  }

  getOperatingPerformanceIndexs() {
    const operatingPerformanceIndexs = [
      { name: '1', code: '1', factor: 1 },
      { name: '2', code: '2', factor: 2 },
      { name: '3', code: '3', factor: 3 }
    ];
    return operatingPerformanceIndexs;
  }

  getsuitabilityIndexs() {
    const suitabilityIndexs = [
      { name: 'A', code: 'A', factor: 1 },
      { name: 'B', code: 'B', factor: 2 },
      { name: 'C', code: 'C', factor: 3 }
    ];

    return suitabilityIndexs;
  }

  getAccessibilities() {
    const accessibilities = [
      { name: 'A1', code: 'A1', factor: 1 },
      { name: 'A2', code: 'A2', factor: 2 },
      { name: 'A3', code: 'A3', factor: 3 }
    ];
    return accessibilities;
  }

  getRequiredPerformanceStandards() {
    const requiredPerformanceStandards = [
      { name: 'P1', code: 'P1', factor: 1 },
      { name: 'P2', code: 'P2', factor: 2 },
      { name: 'P3', code: 'P3', factor: 3 }
    ];
    return requiredPerformanceStandards;
  }

  calculateBudgetPeriods(uamp: UAMP): UAMP {
    uamp.templeteSeven.mtefBudgetPeriods.forEach(element => {
      switch (element.title) {
        case 'New Capital Works T4.1':
          const acquisitionPlansT41 = uamp.templeteFourPointOne.acquisitionPlans.filter(r => r.totalAmountRequired != undefined
            || r.totalAmountRequired != null);
          const year1RequiredBudgetT41 = acquisitionPlansT41.length > 0
            ? acquisitionPlansT41.map(r => r.totalAmountRequired).reduce(function (a, b) {
              return a + b;
            }) : 0;
          element = this.calculateMtefBudgetPeriod(year1RequiredBudgetT41, element);
          const index = uamp.templeteSeven.mtefBudgetPeriods.findIndex(b => b.title == element.title);
          uamp.templeteSeven.mtefBudgetPeriods[index] = element;
          break;
        case 'Refurb., Re-config.& Additions) T5.1':
          const acquisitionPlansT51 = uamp.templeteFivePointOne.operationPlans.filter(r => r.totalAmountRequired != undefined
            || r.totalAmountRequired != null);
          const year1RequiredBudgetT51 = acquisitionPlansT51.length > 0
            ? acquisitionPlansT51.map(r => r.totalAmountRequired).reduce(function (a, b) {
              return a + b;
            }) : 0;
          element = this.calculateMtefBudgetPeriod(year1RequiredBudgetT51, element);
          const indexT5 = uamp.templeteSeven.mtefBudgetPeriods.findIndex(b => b.title == element.title);
          uamp.templeteSeven.mtefBudgetPeriods[indexT5] = element;
          break;
        case 'Total Capital Costs':
          element = this.calculateTotalCapitalCosts(uamp.templeteSeven.mtefBudgetPeriods, element);
          const indexTT = uamp.templeteSeven.mtefBudgetPeriods.findIndex(b => b.title == element.title);
          uamp.templeteSeven.mtefBudgetPeriods[indexTT] = element;
          break;
        case '% Shortfall':
          if (element.group == 'Capital Projects') {
            element = this.calculateShortfallCapitalCosts(uamp.templeteSeven.mtefBudgetPeriods, element);
            const indexs = uamp.templeteSeven.mtefBudgetPeriods.findIndex(b => b.title == element.title);
            uamp.templeteSeven.mtefBudgetPeriods[indexs] = element;
          }
          break;
        case 'Existing Leases T2.2':
          if (element.group == 'Current Expenditure') {
            const propertiesT22 = uamp.templeteTwoPointTwo.properties.filter(r => r.rentalPA != undefined
              || r.rentalPA != null);
            const year1RequiredBudgetT22 = propertiesT22.length > 0 ? propertiesT22.map(r => r.rentalPA).reduce(function (a, b) {
              return a + b;
            }) : 0;
            element = this.calculateMtefBudgetPeriod(year1RequiredBudgetT22, element);
            const indexT22 = uamp.templeteSeven.mtefBudgetPeriods.findIndex(b => b.title == element.title);
            uamp.templeteSeven.mtefBudgetPeriods[indexT22] = element;
          }
          break;
        case 'New leases T4.2':
          if (element.group == 'Current Expenditure') {
            const acquisitionPlansT42 = uamp.templeteFourPointTwo.acquisitionPlans.filter(r => r.totalAmountRequired != undefined
              || r.totalAmountRequired != null);
            const year1RequiredBudgetT42 = acquisitionPlansT42.length > 0 ? acquisitionPlansT42.map(r => r.totalAmountRequired).reduce(function (a, b) {
              return a + b;
            }) : 0;
            element = this.calculateMtefBudgetPeriod(year1RequiredBudgetT42, element);
            const indexT42 = uamp.templeteSeven.mtefBudgetPeriods.findIndex(b => b.title == element.title);
            uamp.templeteSeven.mtefBudgetPeriods[indexT42] = element;
          }
          break;
        case 'Municipal / Utility Services: State-owned (Electricity, water, sewer & refuse) T2.1':
          if (element.group == 'Current Expenditure') {
            const propertiesT21 = uamp.templeteTwoPointOne.properties.filter(r => r.MunicipalUtilityServiceTotal != undefined
              || r.MunicipalUtilityServiceTotal != null);
            const year1RequiredBudgetT21 = propertiesT21.length > 0 ? propertiesT21.map(r => r.MunicipalUtilityServiceTotal).reduce(function (a, b) {
              return a + b;
            }) : 0;
            element = this.calculateMtefBudgetPeriod(year1RequiredBudgetT21, element);
            const indexT21 = uamp.templeteSeven.mtefBudgetPeriods.findIndex(b => b.title == element.title);
            uamp.templeteSeven.mtefBudgetPeriods[indexT21] = element;
          }
          break;
        case 'Municipal / Utility Services: Leased-in (Electricity, water, sewer & refuse)T2.2':
          if (element.group == 'Current Expenditure') {
            const propertiesOCT22 = uamp.templeteTwoPointTwo.properties.filter(r => r.operationalCosts != undefined
              || r.operationalCosts != null);
            const year1RequiredBudgetOCT22 = propertiesOCT22.length > 0 ? propertiesOCT22.map(r => r.operationalCosts).reduce(function (a, b) {
              return a + b;
            }) : 0;
            element = this.calculateMtefBudgetPeriod(year1RequiredBudgetOCT22, element);
            const indexOCT22 = uamp.templeteSeven.mtefBudgetPeriods.findIndex(b => b.title == element.title);
            uamp.templeteSeven.mtefBudgetPeriods[indexOCT22] = element;
          }
          break;
        case 'Property Rates & Taxes T2.1':
          if (element.group == 'Current Expenditure') {
            const propertiesPRT21 = uamp.templeteTwoPointOne.properties.filter(r => r.propertyRatesTaxes != undefined
              || r.operationalCosts != null);
            const year1RequiredBudgetPRTT21 = propertiesPRT21.length > 0 ? propertiesPRT21.map(r => r.operationalCosts).reduce(function (a, b) {
              return a + b;
            }) : 0;
            element = this.calculateMtefBudgetPeriod(year1RequiredBudgetPRTT21, element);
            const indexPRT22 = uamp.templeteSeven.mtefBudgetPeriods.findIndex(b => b.title == element.title);
            uamp.templeteSeven.mtefBudgetPeriods[indexPRT22] = element;
          }
          break;
        case 'Maintenance Requirements (Repairs) T5.2':
          if (element.group == 'Current Expenditure') {
            const operationPlansT52 = uamp.templeteFivePointTwo.operationPlans.filter(r => r.totalAmountRequired != undefined
              || r.totalAmountRequired != null);
            const year1RequiredBudgetART52 = operationPlansT52.length > 0 ? operationPlansT52.map(r => r.totalAmountRequired).reduce(function (a, b) {
              return a + b;
            }) : 0;
            element = this.calculateMtefBudgetPeriod(year1RequiredBudgetART52, element);
            const indexART52 = uamp.templeteSeven.mtefBudgetPeriods.findIndex(b => b.title == element.title);
            uamp.templeteSeven.mtefBudgetPeriods[indexART52] = element;
          }
          break;
        case 'Total Current Costs':
          if (element.group == 'Current Expenditure') {
            element = this.calculateTotalCurrentCosts(uamp.templeteSeven.mtefBudgetPeriods, element);
            const indexTCC = uamp.templeteSeven.mtefBudgetPeriods.findIndex(b => b.title == element.title);
            uamp.templeteSeven.mtefBudgetPeriods[indexTCC] = element;
          }
          break;
        case 'Total Capital Works & Recurrent Costs':
          if (element.group == 'Current Expenditure') {
            element = this.calculateCapitalWorksRecurrentCosts(uamp.templeteSeven.mtefBudgetPeriods, element);
            const indexTCC = uamp.templeteSeven.mtefBudgetPeriods.findIndex(b => b.title == element.title);
            uamp.templeteSeven.mtefBudgetPeriods[indexTCC] = element;
          }
          break;
        case '% Shortfall':
          if (element.group == 'Current Expenditure') {
            element = this.calculateShortfallCurrentExpenditure(uamp.templeteSeven.mtefBudgetPeriods, element);
            const indexs = uamp.templeteSeven.mtefBudgetPeriods.findIndex(b => b.title == element.title);
            uamp.templeteSeven.mtefBudgetPeriods[indexs] = element;
          }
          break;
      }
    });

    return uamp;
  }

  calculateMtefBudgetPeriod(year1RequiredBudget: number, mtefBudgetPeriod: MtefBudgetPeriod): MtefBudgetPeriod {

    const year2Allocation = (6 / 100 * year1RequiredBudget) + year1RequiredBudget;
    const year2RequiredBudget = (4 / 100 * year2Allocation) + year2Allocation;

    const year3Allocation = (6 / 100 * year2RequiredBudget) + year2RequiredBudget;
    const year3RequiredBudget = (4 / 100 * year2Allocation) + year2Allocation;

    const year4Allocation = (6 / 100 * year3RequiredBudget) + year3RequiredBudget;
    const year4RequiredBudget = (4 / 100 * year3Allocation) + year3Allocation;

    const year5Allocation = (6 / 100 * year4RequiredBudget) + year4RequiredBudget;
    const year5RequiredBudget = (4 / 100 * year4Allocation) + year4Allocation;

    let _mtefBudgetPeriod: MtefBudgetPeriod = {
      id: mtefBudgetPeriod.id,
      userImmovableAssetManagementPlanId: mtefBudgetPeriod.userImmovableAssetManagementPlanId,
      order: mtefBudgetPeriod.order,
      isHeader: mtefBudgetPeriod.isHeader,
      isPercentage: mtefBudgetPeriod.isPercentage,
      title: mtefBudgetPeriod.title,
      group: mtefBudgetPeriod.group,
      year1Allocation: mtefBudgetPeriod.year1Allocation == undefined ? 0 : mtefBudgetPeriod.year1Allocation,
      year1RequiredBudget,
      year1Shortfall: mtefBudgetPeriod.year1Allocation - year1RequiredBudget,
      year2Allocation,
      year2RequiredBudget,
      year2Shortfall: year2Allocation - year2RequiredBudget,
      year3Allocation,
      year3RequiredBudget,
      year3Shortfall: year3Allocation - year3RequiredBudget,
      year4Allocation,
      year4RequiredBudget,
      year4Shortfall: year4Allocation - year4RequiredBudget,
      year5Allocation,
      year5RequiredBudget,
      year5Shortfall: year5Allocation - year5RequiredBudget,
    };
    return _mtefBudgetPeriod;
  }

  calculateTotalCapitalCosts(mtefBudgetPeriods: MtefBudgetPeriod[], mtefBudgetPeriod: MtefBudgetPeriod): MtefBudgetPeriod {
    const _mtefBudgetPeriods = mtefBudgetPeriods.filter(m => m.group == 'Capital Projects'
      && !m.title.includes('Total')
      && !m.title.includes('Shortfall'));
    let _mtefBudgetPeriod: MtefBudgetPeriod = {
      id: mtefBudgetPeriod.id,
      userImmovableAssetManagementPlanId: mtefBudgetPeriod.userImmovableAssetManagementPlanId,
      order: mtefBudgetPeriod.order,
      isHeader: mtefBudgetPeriod.isHeader,
      isPercentage: mtefBudgetPeriod.isPercentage,
      title: mtefBudgetPeriod.title,
      group: mtefBudgetPeriod.group,
      year1Allocation: _mtefBudgetPeriods.length > 0 ? _mtefBudgetPeriods.map(r => r.year1Allocation).reduce(function (a, b) { return a + b; }) : 0,
      year1RequiredBudget: _mtefBudgetPeriods.length > 0 ? _mtefBudgetPeriods.map(r => r.year1RequiredBudget).reduce(function (a, b) { return a + b; }) : 0,
      year1Shortfall: _mtefBudgetPeriods.length > 0 ? _mtefBudgetPeriods.map(r => r.year1Shortfall).reduce(function (a, b) { return a + b; }) : 0,
      year2Allocation: _mtefBudgetPeriods.length > 0 ? _mtefBudgetPeriods.map(r => r.year2Allocation).reduce(function (a, b) { return a + b; }) : 0,
      year2RequiredBudget: _mtefBudgetPeriods.length > 0 ? _mtefBudgetPeriods.map(r => r.year2RequiredBudget).reduce(function (a, b) { return a + b; }) : 0,
      year2Shortfall: _mtefBudgetPeriods.length > 0 ? _mtefBudgetPeriods.map(r => r.year2Shortfall).reduce(function (a, b) { return a + b; }) : 0,
      year3Allocation: _mtefBudgetPeriods.length > 0 ? _mtefBudgetPeriods.map(r => r.year3Allocation).reduce(function (a, b) { return a + b; }) : 0,
      year3RequiredBudget: _mtefBudgetPeriods.length > 0 ? _mtefBudgetPeriods.map(r => r.year3RequiredBudget).reduce(function (a, b) { return a + b; }) : 0,
      year3Shortfall: _mtefBudgetPeriods.length > 0 ? _mtefBudgetPeriods.map(r => r.year3Shortfall).reduce(function (a, b) { return a + b; }) : 0,
      year4Allocation: _mtefBudgetPeriods.length > 0 ? _mtefBudgetPeriods.map(r => r.year4Allocation).reduce(function (a, b) { return a + b; }) : 0,
      year4RequiredBudget: _mtefBudgetPeriods.length > 0 ? _mtefBudgetPeriods.map(r => r.year4RequiredBudget).reduce(function (a, b) { return a + b; }) : 0,
      year4Shortfall: _mtefBudgetPeriods.length > 0 ? _mtefBudgetPeriods.map(r => r.year4Shortfall).reduce(function (a, b) { return a + b; }) : 0,
      year5Allocation: _mtefBudgetPeriods.length > 0 ? _mtefBudgetPeriods.map(r => r.year5Allocation).reduce(function (a, b) { return a + b; }) : 0,
      year5RequiredBudget: _mtefBudgetPeriods.length > 0 ? _mtefBudgetPeriods.map(r => r.year5RequiredBudget).reduce(function (a, b) { return a + b; }) : 0,
      year5Shortfall: _mtefBudgetPeriods.length > 0 ? _mtefBudgetPeriods.map(r => r.year5Shortfall).reduce(function (a, b) { return a + b; }) : 0,
    };
    return _mtefBudgetPeriod;
  }

  calculateTotalCurrentCosts(mtefBudgetPeriods: MtefBudgetPeriod[], mtefBudgetPeriod: MtefBudgetPeriod): MtefBudgetPeriod {
    const _mtefBudgetPeriods = mtefBudgetPeriods.filter(m => m.group == 'Current Expenditure'
      && !m.title.includes('Total')
      && !m.title.includes('Shortfall'));
    let _mtefBudgetPeriod: MtefBudgetPeriod = {
      id: mtefBudgetPeriod.id,
      userImmovableAssetManagementPlanId: mtefBudgetPeriod.userImmovableAssetManagementPlanId,
      order: mtefBudgetPeriod.order,
      isHeader: mtefBudgetPeriod.isHeader,
      isPercentage: mtefBudgetPeriod.isPercentage,
      title: mtefBudgetPeriod.title,
      group: mtefBudgetPeriod.group,
      year1Allocation: _mtefBudgetPeriods.length > 0 ? _mtefBudgetPeriods.map(r => r.year1Allocation).reduce(function (a, b) { return a + b; }) : 0,
      year1RequiredBudget: _mtefBudgetPeriods.length > 0 ? _mtefBudgetPeriods.map(r => r.year1RequiredBudget).reduce(function (a, b) { return a + b; }) : 0,
      year1Shortfall: _mtefBudgetPeriods.length > 0 ? _mtefBudgetPeriods.map(r => r.year1Shortfall).reduce(function (a, b) { return a + b; }) : 0,
      year2Allocation: _mtefBudgetPeriods.length > 0 ? _mtefBudgetPeriods.map(r => r.year2Allocation).reduce(function (a, b) { return a + b; }) : 0,
      year2RequiredBudget: _mtefBudgetPeriods.length > 0 ? _mtefBudgetPeriods.map(r => r.year2RequiredBudget).reduce(function (a, b) { return a + b; }) : 0,
      year2Shortfall: _mtefBudgetPeriods.length > 0 ? _mtefBudgetPeriods.map(r => r.year2Shortfall).reduce(function (a, b) { return a + b; }) : 0,
      year3Allocation: _mtefBudgetPeriods.length > 0 ? _mtefBudgetPeriods.map(r => r.year3Allocation).reduce(function (a, b) { return a + b; }) : 0,
      year3RequiredBudget: _mtefBudgetPeriods.length > 0 ? _mtefBudgetPeriods.map(r => r.year3RequiredBudget).reduce(function (a, b) { return a + b; }) : 0,
      year3Shortfall: _mtefBudgetPeriods.length > 0 ? _mtefBudgetPeriods.map(r => r.year3Shortfall).reduce(function (a, b) { return a + b; }) : 0,
      year4Allocation: _mtefBudgetPeriods.length > 0 ? _mtefBudgetPeriods.map(r => r.year4Allocation).reduce(function (a, b) { return a + b; }) : 0,
      year4RequiredBudget: _mtefBudgetPeriods.length > 0 ? _mtefBudgetPeriods.map(r => r.year4RequiredBudget).reduce(function (a, b) { return a + b; }) : 0,
      year4Shortfall: _mtefBudgetPeriods.length > 0 ? _mtefBudgetPeriods.map(r => r.year4Shortfall).reduce(function (a, b) { return a + b; }) : 0,
      year5Allocation: _mtefBudgetPeriods.length > 0 ? _mtefBudgetPeriods.map(r => r.year5Allocation).reduce(function (a, b) { return a + b; }) : 0,
      year5RequiredBudget: _mtefBudgetPeriods.length > 0 ? _mtefBudgetPeriods.map(r => r.year5RequiredBudget).reduce(function (a, b) { return a + b; }) : 0,
      year5Shortfall: _mtefBudgetPeriods.length > 0 ? _mtefBudgetPeriods.map(r => r.year5Shortfall).reduce(function (a, b) { return a + b; }) : 0,
    };
    return _mtefBudgetPeriod;
  }

  calculateCapitalWorksRecurrentCosts(mtefBudgetPeriods: MtefBudgetPeriod[], mtefBudgetPeriod: MtefBudgetPeriod): MtefBudgetPeriod {
    const _mtefBudgetPeriods = mtefBudgetPeriods.filter(m => !m.title.includes('Total')
      && !m.title.includes('Shortfall'));
    let _mtefBudgetPeriod: MtefBudgetPeriod = {
      id: mtefBudgetPeriod.id,
      userImmovableAssetManagementPlanId: mtefBudgetPeriod.userImmovableAssetManagementPlanId,
      order: mtefBudgetPeriod.order,
      isHeader: mtefBudgetPeriod.isHeader,
      isPercentage: mtefBudgetPeriod.isPercentage,
      title: mtefBudgetPeriod.title,
      group: mtefBudgetPeriod.group,
      year1Allocation: _mtefBudgetPeriods.length > 0 ? _mtefBudgetPeriods.map(r => r.year1Allocation).reduce(function (a, b) { return a + b; }) : 0,
      year1RequiredBudget: _mtefBudgetPeriods.length > 0 ? _mtefBudgetPeriods.map(r => r.year1RequiredBudget).reduce(function (a, b) { return a + b; }) : 0,
      year1Shortfall: _mtefBudgetPeriods.length > 0 ? _mtefBudgetPeriods.map(r => r.year1Shortfall).reduce(function (a, b) { return a + b; }) : 0,
      year2Allocation: _mtefBudgetPeriods.length > 0 ? _mtefBudgetPeriods.map(r => r.year2Allocation).reduce(function (a, b) { return a + b; }) : 0,
      year2RequiredBudget: _mtefBudgetPeriods.length > 0 ? _mtefBudgetPeriods.map(r => r.year2RequiredBudget).reduce(function (a, b) { return a + b; }) : 0,
      year2Shortfall: _mtefBudgetPeriods.length > 0 ? _mtefBudgetPeriods.map(r => r.year2Shortfall).reduce(function (a, b) { return a + b; }) : 0,
      year3Allocation: _mtefBudgetPeriods.length > 0 ? _mtefBudgetPeriods.map(r => r.year3Allocation).reduce(function (a, b) { return a + b; }) : 0,
      year3RequiredBudget: _mtefBudgetPeriods.length > 0 ? _mtefBudgetPeriods.map(r => r.year3RequiredBudget).reduce(function (a, b) { return a + b; }) : 0,
      year3Shortfall: _mtefBudgetPeriods.length > 0 ? _mtefBudgetPeriods.map(r => r.year3Shortfall).reduce(function (a, b) { return a + b; }) : 0,
      year4Allocation: _mtefBudgetPeriods.length > 0 ? _mtefBudgetPeriods.map(r => r.year4Allocation).reduce(function (a, b) { return a + b; }) : 0,
      year4RequiredBudget: _mtefBudgetPeriods.length > 0 ? _mtefBudgetPeriods.map(r => r.year4RequiredBudget).reduce(function (a, b) { return a + b; }) : 0,
      year4Shortfall: _mtefBudgetPeriods.length > 0 ? _mtefBudgetPeriods.map(r => r.year4Shortfall).reduce(function (a, b) { return a + b; }) : 0,
      year5Allocation: _mtefBudgetPeriods.length > 0 ? _mtefBudgetPeriods.map(r => r.year5Allocation).reduce(function (a, b) { return a + b; }) : 0,
      year5RequiredBudget: _mtefBudgetPeriods.length > 0 ? _mtefBudgetPeriods.map(r => r.year5RequiredBudget).reduce(function (a, b) { return a + b; }) : 0,
      year5Shortfall: _mtefBudgetPeriods.length > 0 ? _mtefBudgetPeriods.map(r => r.year5Shortfall).reduce(function (a, b) { return a + b; }) : 0,
    };
    return _mtefBudgetPeriod;
  }

  calculateShortfallCapitalCosts(mtefBudgetPeriods: MtefBudgetPeriod[], mtefBudgetPeriod: MtefBudgetPeriod): MtefBudgetPeriod {
    const _totalMtefBudgetPeriod = mtefBudgetPeriods.filter(m => m.group == 'Capital Projects'
      && m.title.includes('Shortfall'))[0];
    let _mtefBudgetPeriod: MtefBudgetPeriod = {
      id: mtefBudgetPeriod.id,
      userImmovableAssetManagementPlanId: mtefBudgetPeriod.userImmovableAssetManagementPlanId,
      order: mtefBudgetPeriod.order,
      isHeader: mtefBudgetPeriod.isHeader,
      isPercentage: mtefBudgetPeriod.isPercentage,
      title: mtefBudgetPeriod.title,
      group: mtefBudgetPeriod.group,
      year1Allocation: 0,
      year1RequiredBudget: 0,
      year1Shortfall: Number(_totalMtefBudgetPeriod.year1Shortfall / _totalMtefBudgetPeriod.year1Allocation),
      year2Allocation: 0,
      year2RequiredBudget: 0,
      year2Shortfall: Number(_totalMtefBudgetPeriod.year2Shortfall / _totalMtefBudgetPeriod.year2Allocation),
      year3Allocation: 0,
      year3RequiredBudget: 0,
      year3Shortfall: Number(_totalMtefBudgetPeriod.year3Shortfall / _totalMtefBudgetPeriod.year3Allocation),
      year4Allocation: 0,
      year4RequiredBudget: 0,
      year4Shortfall: Number(_totalMtefBudgetPeriod.year4Shortfall / _totalMtefBudgetPeriod.year4Allocation),
      year5Allocation: 0,
      year5RequiredBudget: 0,
      year5Shortfall: Number(_totalMtefBudgetPeriod.year5Shortfall / _totalMtefBudgetPeriod.year5Allocation),
    };
    return _mtefBudgetPeriod;
  }

  calculateShortfallCurrentExpenditure(mtefBudgetPeriods: MtefBudgetPeriod[], mtefBudgetPeriod: MtefBudgetPeriod): MtefBudgetPeriod {
    const _totalMtefBudgetPeriod = mtefBudgetPeriods.filter(m => m.group == 'Capital Projects'
      && m.title.includes('Shortfall'))[0];
    let _mtefBudgetPeriod: MtefBudgetPeriod = {
      id: mtefBudgetPeriod.id,
      userImmovableAssetManagementPlanId: mtefBudgetPeriod.userImmovableAssetManagementPlanId,
      order: mtefBudgetPeriod.order,
      isHeader: mtefBudgetPeriod.isHeader,
      isPercentage: mtefBudgetPeriod.isPercentage,
      title: mtefBudgetPeriod.title,
      group: mtefBudgetPeriod.group,
      year1Allocation: 0,
      year1RequiredBudget: 0,
      year1Shortfall: Number(_totalMtefBudgetPeriod.year1Shortfall / _totalMtefBudgetPeriod.year1Allocation),
      year2Allocation: 0,
      year2RequiredBudget: 0,
      year2Shortfall: Number(_totalMtefBudgetPeriod.year2Shortfall / _totalMtefBudgetPeriod.year2Allocation),
      year3Allocation: 0,
      year3RequiredBudget: 0,
      year3Shortfall: Number(_totalMtefBudgetPeriod.year3Shortfall / _totalMtefBudgetPeriod.year3Allocation),
      year4Allocation: 0,
      year4RequiredBudget: 0,
      year4Shortfall: Number(_totalMtefBudgetPeriod.year4Shortfall / _totalMtefBudgetPeriod.year4Allocation),
      year5Allocation: 0,
      year5RequiredBudget: 0,
      year5Shortfall: Number(_totalMtefBudgetPeriod.year5Shortfall / _totalMtefBudgetPeriod.year5Allocation),
    };
    return _mtefBudgetPeriod;
  }

  initLeasedProperty() {
    const leasedProperty: LeasedProperty = {
      leaseStatusesId: 0,
      fileReference: undefined,
      district: undefined,
      type: undefined,
      propertyCode: undefined,
      facilityName: undefined,
      natureofLease: undefined,
      startingDate: undefined,
      terminationDate: undefined,
      landId: undefined,
      landUseManagementDetail: {
        id: 0,
        titleDeedNumber: undefined,
        deedsOffice: undefined,
        registrationDate: undefined,
        registeredOwner: undefined,
        vestingDate: undefined,
        ownershipCategory: undefined,
        stateOwnedPercentage: undefined,
        landUse: undefined,
        zoning: undefined,
        userDepartment: undefined,
        facilityName: undefined,
        incomeLeaseStatus: undefined
      },
      leaseStatus: {
        id: 0,
        natureOfLease: undefined,
        iDNumberCompanyRegistrationNumber: undefined,
        pOBox: undefined,
        contactNumber: undefined,
        capacityofContactPerson: undefined,
        contactPerson: undefined,
        postalCode: undefined,
        leaseStatusTown: undefined,
        rentalAmount: undefined,
        terminationDate: undefined,
        startingDate: undefined,
        occupationDate: undefined,
        escalation: undefined,
        vat: undefined,
        leaseNumber: undefined,
        otherCharges: undefined
      }
    };
    return leasedProperty;
  }

  getManagedBylist() {
    return [
      { name: 'Employee', code: 'E', factor: 1 },
      { name: 'External Company', code: 'C', factor: 2 },
    ];
  }
}

