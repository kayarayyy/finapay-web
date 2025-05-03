import { Component, OnInit } from '@angular/core';
import { Branch } from '../../core/models/branch.model';
import { BranchService } from '../../core/services/branch.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { TableComponent } from '../../shared/components/table/table.component';

@Component({
  selector: 'app-branch',
  standalone: true,
  imports: [CardComponent, TableComponent],
  templateUrl: './branch.component.html',
  styleUrl: './branch.component.css'
})
export class BranchComponent implements OnInit {
  branches: Branch[] = [];
  isLoading = true;
  pageOffset = 0;

  columns = [
    { header: 'Name', field: 'name' },
    { header: 'City', field: 'city' },
    { header: 'Location', field: 'location' },
    { header: 'Branch Manager', field: 'branchManagerEmail' },
    { header: 'Marketing', field: 'marketingEmails' }
  ];


  constructor(private branchService: BranchService) { }

  ngOnInit(): void {
    this.branchService.getAllBranches().subscribe({
      next: (value) => {
        this.branches = value.map(branch => ({
          ...branch,
          location: `lat: ${branch.latitude}, long: ${branch.longitude}`,
          branchManagerEmail: branch.branchManager?.email || '-',
          marketingEmails: branch.marketing.map(m => m.email).join(', ') || '-',
          delete: () => this.deleteBranch(branch.id)
        }));
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });

  }

  onPage(event: any) {
    this.pageOffset = event.offset;
  }

  deleteBranch(id: string): void {

  }
}
