import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { SidebarComponent } from './sidebar-layout/sidebar-layout.component';
import {
  RouterOutlet,
  Router,
  RouterModule,
  NavigationEnd,
} from '@angular/router';
import { AuthSessionService } from '../../core/services/auth-session.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './navbar-layout/navbar-layout.component';
import { filter } from 'rxjs';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    SidebarComponent,
    NavbarComponent,
    RouterOutlet,
    CommonModule,
    RouterModule,
  ],
  templateUrl: './main-layout.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class MainLayoutComponent implements OnInit {
  currentPath: string = '';
  currentDateTime: string = '';

  constructor(private session: AuthSessionService, private router: Router) {}

  @ViewChild('offcanvasSidebar', { static: false })
  offcanvasSidebar!: ElementRef;

  ngOnInit() {
    // Update path setiap navigasi
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        const path = e.urlAfterRedirects.split('?')[0];
        // Buang UUID di akhir
        const pathParts = path.split('/');
        if (
          pathParts.length > 2 &&
          this.isUUID(pathParts[pathParts.length - 1])
        ) {
          pathParts.pop();
        }
        this.currentPath = pathParts
          .map((part: string) => this.capitalize(part))
          .join(' / ');
      });

    // Update waktu real-time
    this.updateDateTime();
    setInterval(() => this.updateDateTime(), 1000);
  }

  capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  updateDateTime() {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'Asia/Jakarta',
    });
    this.currentDateTime = formatter.format(now) + ' WIB';
  }

  isUUID(str: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      str
    );
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
