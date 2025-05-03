import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisbursementDetailComponent } from './disbursement-detail.component';

describe('DisbursementDetailComponent', () => {
  let component: DisbursementDetailComponent;
  let fixture: ComponentFixture<DisbursementDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisbursementDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisbursementDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
