import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisbursementLoanComponent } from './disbursement-loan.component';

describe('DisbursementLoanComponent', () => {
  let component: DisbursementLoanComponent;
  let fixture: ComponentFixture<DisbursementLoanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisbursementLoanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisbursementLoanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
