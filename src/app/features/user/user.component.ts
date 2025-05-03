import { DatatableComponent, NgxDatatableModule } from '@swimlane/ngx-datatable';
import { Component, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { User } from '../../core/models/user.model';
import { UserService } from '../../core/services/user.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { CardComponent } from '../../shared/components/card/card.component';
import { FormsModule } from '@angular/forms';
import { TableComponent } from '../../shared/components/table/table.component';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CardComponent, TableComponent, CommonModule],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class UserComponent implements OnInit {
  users: User[] = [];
  isLoading = true;
  pageOffset = 0;
  columns: any[] = [];

  @ViewChild('statusTpl', { static: true }) statusTpl!: TemplateRef<any>;


  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.columns = [
      { header: 'Name', field: 'name' },
      { header: 'Nip', field: 'nip' },
      { header: 'Email', field: 'email' },
      { header: 'Role', field: 'role' },
      { header: 'Referral', field: 'refferal' },
      { header: 'Status', field: 'active', isCustom: true, templateRef: this.statusTpl }
    ];
    this.userService.getAllUsers().subscribe({
      next: (res) => {
        this.users = res.map(user => ({
          ...user
        }));
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  onPage(event: any) {
    this.pageOffset = event.offset;
  }

  deleteUser(id: string, name: string): void {
    Swal.fire({
      title: 'Apakah Anda yakin?',
      text: 'Data user ' + name + ' yang dihapus tidak dapat dikembalikan!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.deleteUserById(id).subscribe(
          (response) => {
            if (response.status === 'success') {
              // Tampilkan konfirmasi sukses
              Swal.fire({
                title: 'Sukses!',
                text: 'User telah dihapus.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
              });

              // Hapus user dari daftar setelah berhasil dihapus
              this.users = this.users.filter(user => user.id !== id);
            } else {
              Swal.fire({
                title: 'Gagal!',
                text: response.message || 'Terjadi kesalahan.',
                icon: 'error',
                confirmButtonColor: '#d33',
              });
            }
          },
          (error) => {
            Swal.fire({
              title: 'Gagal!',
              text: 'Terjadi kesalahan saat menghapus user.',
              icon: 'error',
              confirmButtonColor: '#d33',
            });
          }
        );
      }
    });
  }
}
