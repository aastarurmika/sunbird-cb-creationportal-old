import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatButtonModule, MatIconModule, MatMenuModule, MatTooltipModule, MatSlideToggleModule, MatDialogModule } from '@angular/material'
import { BtnProfileComponent } from './btn-profile.component'
import { RouterModule } from '@angular/router'
import { AvatarPhotoModule } from '../_common/avatar-photo/avatar-photo.module'
import { LogoutModule } from '../../../../utils/src/public-api'
import { WidgetResolverModule } from '../../../../resolver/src/public-api'
// import { TreeCatalogModule } from '../tree-catalog/tree-catalog.module'

@NgModule({
  declarations: [BtnProfileComponent],
  imports: [
    AvatarPhotoModule,
    CommonModule,
    LogoutModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatSlideToggleModule,
    RouterModule,
    WidgetResolverModule,

  ],
  entryComponents: [BtnProfileComponent],
})
export class BtnProfileModule { }
