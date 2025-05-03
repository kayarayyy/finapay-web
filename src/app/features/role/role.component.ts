import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CardComponent } from '../../shared/components/card/card.component';
import { TableComponent } from '../../shared/components/table/table.component';
import { RoleFeature } from '../../core/models/role-feature.model';
import { RoleFeatureService } from '../../core/services/role-feature.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-role',
  standalone: true,
  imports: [CardComponent, TableComponent, CommonModule],
  templateUrl: './role.component.html',
  styleUrl: './role.component.css'
})
export class RoleComponent implements OnInit {
  @ViewChild('featuresTpl', { static: true }) featuresTpl!: TemplateRef<any>;
  role_features: RoleFeature[] = [];
  isLoading = true;
  pageOffset = 0;

  columns = [
    { header: 'Role', field: 'name' },
    { header: 'Features', field: 'listFeatures', isCustom: true, templateRef: this.featuresTpl }
  ];


  constructor(private roleFeatureService: RoleFeatureService) { }

  ngOnInit(): void {
    this.columns = [
      { header: 'Role', field: 'name' },
      { header: 'Features', field: 'listFeatures', isCustom: true, templateRef: this.featuresTpl }
    ];

    this.roleFeatureService.getAllRoleWithFeatures().subscribe({
      next: (value) => {
        this.role_features = value;
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
  removeFeatureFromRole(roleId: string, featureId: string) {
    // Tambahkan konfirmasi dan logika penghapusan dari API
    console.log('Hapus feature', featureId, 'dari role', roleId);
  }


  deleteRole(id: string): void { }
}
