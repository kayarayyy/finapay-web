import { NgIf } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';  // Pastikan RouterModule diimpor
import { AuthSessionService } from '../../../core/services/auth-session.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, NgIf],  // Impor RouterModule di sini
  templateUrl: './sidebar-layout.component.html',
  styleUrl: './sidebar-layout.component.css',
  encapsulation: ViewEncapsulation.None
})
export class SidebarComponent {
  constructor(private authSessionService: AuthSessionService) {}

  hasFeature(feature: string): boolean {
    const features = this.authSessionService.features;
    return features.includes(feature);
  }
}
