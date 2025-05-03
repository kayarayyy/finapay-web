import { Component, EventEmitter, Input, Output, SimpleChanges, TemplateRef, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

export interface ColumnDef {
  header: string;
  field: string;
  isCustom?: boolean; // untuk menandai bahwa ini kolom dengan konten template custom
  templateRef?: TemplateRef<any>; // referensi template yang ingin dipakai
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxDatatableModule],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class TableComponent {
  @Input() columns: ColumnDef[] = [];
  @Input() originalRows: any[] = [];
  @Input() isLoading: boolean = false;
  @Input() pageOffset: number = 0;
  @Input() actionTemplate!: TemplateRef<any>;
  @Output() onPage = new EventEmitter<any>();

  searchTerm: string = '';
  rows: any[] = [];
  itemsPerPage: number = 5; // Default items per page
  itemsPerPageOptions: number[] = [5, 10, 20, 50]; // Options for items per page

  ngOnChanges(): void {
    this.rows = [...this.originalRows];
    this.filterUsers();
  }
  
  ngOnInit(): void {
    this.rows = [...this.originalRows];
    this.filterUsers();
  }
  

  filterUsers() {
    const term = this.searchTerm.toLowerCase();
    this.rows = this.originalRows.filter(row =>
      this.columns.some(col =>
        (row[col.field]?.toString().toLowerCase() ?? '').includes(term)
      )
    );
  }

  onPageChange(event: any) {
    this.pageOffset = event.offset;
    this.onPage.emit(event);
  }

  onItemsPerPageChange() {
    this.pageOffset = 0; // Reset to first page when the items per page is changed
    this.onPage.emit({ offset: this.pageOffset });
  }
}
