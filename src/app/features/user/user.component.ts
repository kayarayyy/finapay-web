import { RoleFeatureService } from './../../core/services/role-feature.service';
import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  OnDestroy,
  inject,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  BehaviorSubject,
  Observable,
  Subject,
  finalize,
  takeUntil,
} from 'rxjs';
import Swal from 'sweetalert2';

import { User } from '../../core/models/user.model';
import { UserService } from '../../core/services/user.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { TableComponent } from '../../shared/components/table/table.component';
import { RoleFeature } from '../../core/models/role-feature.model';
import { AuthService } from '../../core/services/auth.service';

declare var bootstrap: any;

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CardComponent, TableComponent, CommonModule, ReactiveFormsModule],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
})
export class UserComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private roleFeatureService = inject(RoleFeatureService);

  // State Management dengan BehaviorSubject
  private usersSubject$ = new BehaviorSubject<User[]>([]);
  private isLoadingSubject$ = new BehaviorSubject<boolean>(true);
  private isSubmittingSubject$ = new BehaviorSubject<boolean>(false);

  // Observables untuk template
  users$: Observable<User[]> = this.usersSubject$.asObservable();
  isLoading$: Observable<boolean> = this.isLoadingSubject$.asObservable();
  isSubmitting$: Observable<boolean> = this.isSubmittingSubject$.asObservable();
  roles: RoleFeature[] = [];
  // Form dan Modal
  userForm!: FormGroup;
  isEditMode = false;
  currentUserId: string | null = null;

  // Table configuration
  pageOffset = 0;
  columns: any[] = [];

  // Modal instance
  private modalInstance: any;

  @ViewChild('statusTpl', { static: true }) statusTpl!: TemplateRef<any>;

  ngOnInit(): void {
    this.initializeColumns();
    this.initializeForm();
    this.loadUsers();
    this.fetchRoles();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchRoles(): void {
    this.roleFeatureService.getAllRoleWithFeatures().subscribe({
      next: (value) => {
        this.roles = value.filter(
          (role) => role.name?.toUpperCase() !== 'CUSTOMER'
        );
        console.log(this.roles); // Periksa isi dari roles
      },
      error: () => {
        console.error('Gagal mengambil data roles');
      },
    });
  }

  private initializeColumns(): void {
    this.columns = [
      { header: 'Name', field: 'name' },
      { header: 'NIP', field: 'nip' },
      { header: 'Email', field: 'email' },
      { header: 'Role', field: 'role' },
      { header: 'Referral', field: 'refferal' },
      {
        header: 'Status',
        field: 'active',
        isCustom: true,
        templateRef: this.statusTpl,
      },
    ];
  }

  private initializeForm(): void {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      nip: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      refferal: [''],
      active: [true],
    });
  }

  private loadUsers(): void {
    this.isLoadingSubject$.next(true);

    this.userService
      .getAllUsers()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoadingSubject$.next(false))
      )
      .subscribe({
        next: (users) => {
          this.usersSubject$.next(users);
        },
        error: (error) => {
          console.error('Error loading users:', error);
          Swal.fire({
            title: 'Error!',
            text: 'Gagal memuat data user',
            icon: 'error',
            confirmButtonColor: '#d33',
          });
        },
      });
  }

  onPage(event: any): void {
    this.pageOffset = event.offset;
  }

  openAddUserModal(): void {
    this.isEditMode = false;
    this.currentUserId = null;
    this.userForm.reset();
    this.userForm.patchValue({ active: true });
    this.userForm.get('email')?.enable();
    this.showModal();
  }

  openEditUserModal(user: User): void {
    this.isEditMode = true;
    this.currentUserId = user.id;
    this.userForm.patchValue({
      name: user.name,
      nip: user.nip,
      email: user.email,
      role: this.roles.find((role) => role.name === user.role)?.id,
      refferal: user.refferal,
      active: user.active,
    });
    this.userForm.get('email')?.disable();
    this.showModal();
  }

  private showModal(): void {
    const modalElement = document.getElementById('userModal');
    if (modalElement) {
      this.modalInstance = new bootstrap.Modal(modalElement);
      this.modalInstance.show();
    }
  }

  private hideModal(): void {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.isSubmittingSubject$.next(true);

      const formData = { ...this.userForm.value };

      // Re-enable email field to get its value if in edit mode
      if (this.isEditMode) {
        this.userForm.get('email')?.enable();
        formData.email = this.userForm.get('email')?.value;
      }

      const request$ = this.isEditMode
        ? this.userService.updateUser(this.currentUserId!, formData)
        : this.authService.register(
            formData.nip,
            formData.name,
            formData.email,
            formData.role,
            formData.refferal,
            formData.active
          );
      console.log(formData);
      request$
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => {
            this.isSubmittingSubject$.next(false);
            if (this.isEditMode) {
              this.userForm.get('email')?.disable();
            }
          })
        )
        .subscribe({
          next: (response) => {
            if (response.status === 'success') {
              Swal.fire({
                title: 'Sukses!',
                text: `User berhasil ${
                  this.isEditMode ? 'diupdate' : 'ditambahkan'
                }`,
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
              });

              this.hideModal();
              this.loadUsers(); // Reload data
            } else {
              Swal.fire({
                title: 'Gagal!',
                text: response.message || 'Terjadi kesalahan',
                icon: 'error',
                confirmButtonColor: '#d33',
              });
            }
          },
          error: (error) => {
            console.error('Error saving user:', error);
            Swal.fire({
              title: 'Gagal!',
              text:
                error.error?.message || 'Terjadi kesalahan saat menyimpan user',
              icon: 'error',
              confirmButtonColor: '#d33',
            });
          },
        });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.userForm.controls).forEach((key) => {
        this.userForm.get(key)?.markAsTouched();
      });
    }
  }

  deleteUser(id: string, name: string): void {
    Swal.fire({
      title: 'Apakah Anda yakin?',
      text: `Data user ${name} yang dihapus tidak dapat dikembalikan!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService
          .deleteUserById(id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response) => {
              if (response.status === 'success') {
                Swal.fire({
                  title: 'Sukses!',
                  text: 'User telah dihapus',
                  icon: 'success',
                  timer: 1500,
                  showConfirmButton: false,
                });

                // Update state secara reaktif
                const currentUsers = this.usersSubject$.value;
                const updatedUsers = currentUsers.filter(
                  (user) => user.id !== id
                );
                this.usersSubject$.next(updatedUsers);
              } else {
                Swal.fire({
                  title: 'Gagal!',
                  text: response.message || 'Terjadi kesalahan',
                  icon: 'error',
                  confirmButtonColor: '#d33',
                });
              }
            },
            error: (error) => {
              console.error('Error deleting user:', error);
              Swal.fire({
                title: 'Gagal!',
                text: 'Terjadi kesalahan saat menghapus user',
                icon: 'error',
                confirmButtonColor: '#d33',
              });
            },
          });
      }
    });
  }
}
