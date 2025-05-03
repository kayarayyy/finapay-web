import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewLoanComponent } from './review-loan.component';

describe('ReviewLoanComponent', () => {
  let component: ReviewLoanComponent;
  let fixture: ComponentFixture<ReviewLoanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewLoanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReviewLoanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
