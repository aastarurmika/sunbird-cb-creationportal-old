import { Component, OnDestroy, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Router } from '@angular/router'
import { NOTIFICATION_TIME } from '@ws/author/src/lib/constants/constant'
import { Notify } from '@ws/author/src/lib/constants/notificationMessage'
import { ICreateEntity } from '@ws/author/src/lib/interface/create-entity'
import { ErrorParserComponent } from '@ws/author/src/lib/modules/shared/components/error-parser/error-parser.component'
import { NotificationComponent } from '@ws/author/src/lib/modules/shared/components/notification/notification.component'
import { AccessControlService } from '@ws/author/src/lib/modules/shared/services/access-control.service'
import { AuthInitService } from '@ws/author/src/lib/services/init.service'
import { LoaderService } from '@ws/author/src/lib/services/loader.service'
import { Subscription } from 'rxjs'
import { CreateService } from './create.service'
import { REVIEW_ROLE, PUBLISH_ROLE, CREATE_ROLE } from '@ws/author/src/lib/constants/content-role'
import { FormBuilder, FormControl, FormGroup } from '@angular/forms'

@Component({
  selector: 'ws-auth-generic',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
})
export class CreateComponent implements OnInit, OnDestroy {
  entity: ICreateEntity[] = []
  resourceEntity!: ICreateEntity
  routerSubscription = <Subscription>{}
  allLanguages: any
  language = ''
  error = false
  panelOpenState = false
  allowReview = false
  allowAuthor = false
  allowAuthorContentCreate = false
  allowRedo = false
  allowPublish = false
  allowExpiry = false
  allowRestore = false
  isNewDesign = false
  content: ICreateEntity | undefined
  courseObj = ''
  courseEntity!: ICreateEntity
  createCourseForm!: FormGroup

  constructor(
    private snackBar: MatSnackBar,
    private svc: CreateService,
    private router: Router,
    private loaderService: LoaderService,
    private accessControlSvc: AccessControlService,
    private authInitService: AuthInitService,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    this.authInitService.creationEntity.forEach(v => {
      if (!v.parent && v.available) {
        if (v.id === 'resource') {
          this.resourceEntity = v
        } else {
          if (v.id === 'course') {
            this.courseEntity = v
          } else {
            this.entity.push(v)
          }
        }
      }
    })
    this.loaderService.changeLoadState(false)
    this.allLanguages = this.authInitService.ordinals.subTitles || []
    this.language = this.accessControlSvc.locale

    this.allowAuthor = this.canShow('author')
    this.allowAuthorContentCreate = this.canShow('author_create')
    this.allowRedo = this.accessControlSvc.authoringConfig.allowRedo
    this.allowRestore = this.accessControlSvc.authoringConfig.allowRestore
    this.allowExpiry = this.accessControlSvc.authoringConfig.allowExpiry
    this.allowReview = this.canShow('review') && this.accessControlSvc.authoringConfig.allowReview
    this.allowPublish = this.canShow('publish') && this.accessControlSvc.authoringConfig.allowPublish
  }

  canShow(role: string): boolean {
    switch (role) {
      case 'review':
        return this.accessControlSvc.hasRole(REVIEW_ROLE)
      case 'publish':
        return this.accessControlSvc.hasRole(PUBLISH_ROLE)
      case 'author':
        return this.accessControlSvc.hasRole(CREATE_ROLE) || this.accessControlSvc.hasRole(REVIEW_ROLE)
          || this.accessControlSvc.hasRole(PUBLISH_ROLE)
      case 'author_create':
        return this.accessControlSvc.hasRole(CREATE_ROLE)
      default:
        return false
    }
  }

createBtn() {
  this.router.navigateByUrl('/author/create')
}
  ngOnDestroy() {
    this.loaderService.changeLoad.next(false)
  }

  contentClicked(content: ICreateEntity) {
    if (content) {
      // this.showCreateCourseForm = true
      this.content = content
    }
  }

  // createCourseClicked() {
  //   this.loaderService.changeLoad.next(true)
  //   if (this.content) {
  //   this.svc
  //     .create({
  //       contentType: this.content.contentType,
  //       mimeType: this.content.mimeType,
  //       locale: this.language,
  //       ...(this.content.additionalMeta || {}),
  //     })
  //     .subscribe(
  //       (id: string) => {
  //         this.loaderService.changeLoad.next(false)
  //         this.snackBar.openFromComponent(NotificationComponent, {
  //           data: {
  //             type: Notify.CONTENT_CREATE_SUCCESS,
  //           },
  //           duration: NOTIFICATION_TIME * 1000,
  //         })
  //         this.router.navigateByUrl(`/author/editor/${id}`)
  //       },
  //       error => {
  //         if (error.status === 409) {
  //           this.dialog.open(ErrorParserComponent, {
  //             width: '80vw',
  //             height: '90vh',
  //             data: {
  //               errorFromBackendData: error.error,
  //             },
  //           })
  //         }
  //         this.loaderService.changeLoad.next(false)
  //         this.snackBar.openFromComponent(NotificationComponent, {
  //           data: {
  //             type: Notify.CONTENT_FAIL,
  //           },
  //           duration: NOTIFICATION_TIME * 1000,
  //         })
  //       },
  //     )
  //   }
  // }

  createCourseClicked() {
    this.loaderService.changeLoad.next(true)
    const _name = this.createCourseForm.get('name')
    const _purpose = this.createCourseForm.get('purpose')
    if (this.content && _name && _name.value && _purpose && _purpose.value) {

      this.svc
        .createV2({
          name: _name.value,
          purpose: _purpose.value,
          contentType: this.content.contentType,
          mimeType: this.content.mimeType,
          locale: this.language,
          primaryCategory: this.content.primaryCategory,
          ...(this.content.additionalMeta || {}),
        })
        .subscribe(
          (id: string) => {
            this.loaderService.changeLoad.next(false)
            this.snackBar.openFromComponent(NotificationComponent, {
              data: {
                type: Notify.CONTENT_CREATE_SUCCESS,
              },
              duration: NOTIFICATION_TIME * 1000,
            })
            this.router.navigateByUrl(`/author/editor/${id}`)
          },
          error => {
            if (error.status === 409) {
              this.dialog.open(ErrorParserComponent, {
                width: '80vw',
                height: '90vh',
                data: {
                  errorFromBackendData: error.error,
                },
              })
            }
            this.loaderService.changeLoad.next(false)
            this.snackBar.openFromComponent(NotificationComponent, {
              data: {
                type: Notify.CONTENT_FAIL,
              },
              duration: NOTIFICATION_TIME * 1000,
            })
          },
        )
    }
  }

  createForm() {
    this.createCourseForm = this.formBuilder.group({
      name: new FormControl('', []),
    })
  }

  setCurrentLanguage(lang: string) {
    this.language = lang
  }
}
