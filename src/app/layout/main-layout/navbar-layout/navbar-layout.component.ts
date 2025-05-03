import {
  Component,
  EventEmitter,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { AuthSessionService } from '../../../core/services/auth-session.service';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule],
  templateUrl: './navbar-layout.component.html',
  styleUrl: './navbar-layout.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class NavbarComponent {
  @Output() toggleSidebarEvent = new EventEmitter<void>();
  userName: string = '';
  userRole: string = '';

  constructor(private session: AuthSessionService, private router: Router) {}

  toggleSidebar() {
    this.toggleSidebarEvent.emit();
  }

  ngOnInit() {
    this.userName = this.session.name;
    this.userRole = this.session.role;
  }

  logout(event?: MouseEvent): void {
    if (event) event.preventDefault();

    Swal.fire({
      title: 'Logout dari aplikasi?',
      text: 'Anda akan keluar dari sesi saat ini.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0d6efd',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Ya, logout',
      cancelButtonText: 'Batal',
    }).then((result) => {
      if (result.isConfirmed) {
        this.session.clearSession();
        this.router.navigate(['/login']);

        Swal.fire({
          title: 'Logged out!',
          text: 'Anda telah berhasil keluar.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  }
}
