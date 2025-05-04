import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovalLoanComponent } from './approval-loan.component';

describe('ApprovalLoanComponent', () => {
  let component: ApprovalLoanComponent;
  let fixture: ComponentFixture<ApprovalLoanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApprovalLoanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApprovalLoanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
