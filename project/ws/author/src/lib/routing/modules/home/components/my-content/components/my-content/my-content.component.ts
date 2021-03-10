import { AuthExpiryDateConfirmComponent } from '@ws/author/src/lib/modules/shared/components/auth-expiry-date-confirm/auth-expiry-date-confirm.component'
import { FlatTreeControl } from '@angular/cdk/tree'
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { FormGroup } from '@angular/forms'
import { MatDialog, MatSnackBar, MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material'
import { ActivatedRoute, Router } from '@angular/router'
import { NOTIFICATION_TIME } from '@ws/author/src/lib/constants/constant'
import { Notify } from '@ws/author/src/lib/constants/notificationMessage'
import { NSApiRequest } from '@ws/author/src/lib/interface/apiRequest'
import {
  IAuthoringPagination,
  IFilterMenuNode,
  IMenuFlatNode,
} from '@ws/author/src/lib/interface/authored'
import { NSContent } from '@ws/author/src/lib/interface/content'
import { CommentsDialogComponent } from '@ws/author/src/lib/modules/shared/components/comments-dialog/comments-dialog.component'
import { ConfirmDialogComponent } from '@ws/author/src/lib/modules/shared/components/confirm-dialog/confirm-dialog.component'
import { ErrorParserComponent } from '@ws/author/src/lib/modules/shared/components/error-parser/error-parser.component'
import { NotificationComponent } from '@ws/author/src/lib/modules/shared/components/notification/notification.component'
import { AccessControlService } from '@ws/author/src/lib/modules/shared/services/access-control.service'
import { AuthInitService } from '@ws/author/src/lib/services/init.service'
import { LoaderService } from '@ws/author/src/lib/services/loader.service'
import { Subscription } from 'rxjs'
import { MyContentService } from '../../services/my-content.service'
import { map } from 'rxjs/operators'
import { ConfigurationsService, PipeDurationTransformPipe, ValueService } from '@ws-widget/utils'

/* tslint:disable */
import _ from 'lodash'
import { ILeftMenu, ITable } from '@ws-widget/collection'
import { PipeContentTypePipe } from '../../../../../../../../../../../../library/ws-widget/utils/src/lib/pipes/pipe-content-type/pipe-content-type.pipe'
/* tslint:enable */

const defaultFilter = [
  {
    key: 'contentType',
    value: [
      'Collection', 'Course', 'Learning Path',
    ],
  },
]
@Component({
  selector: 'ws-auth-my-content',
  templateUrl: './my-content.component.html',
  styleUrls: ['./my-content.component.scss'],
  providers: [PipeDurationTransformPipe],
})
export class MyContentComponent implements OnInit, OnDestroy {
  filterPath = '/author/cbp/me'
  public sideNavBarOpened = false
  public sideNavBarOpenedMain = true
  newDesign = true
  tableData!: ITable
  // currentFilter = 'publish'
  filterMenuTreeControl: FlatTreeControl<IMenuFlatNode>
  filterMenuTreeFlattener: any
  public cardContent!: any[]
  public filters: any[] = []
  // public status = 'draft'
  public status = 'published'
  public fetchError = false
  contentType: string[] = []
  complexityLevel: string[] = []
  unit: string[] = []
  finalFilters: any = defaultFilter
  allLanguages: any[] = []
  searchLanguage = ''
  public pagination!: IAuthoringPagination
  userId!: string
  myRoles!: Set<string>
  totalContent!: number
  showLoadMore!: boolean
  routerSubscription = <Subscription>{}
  queryFilter = ''
  ordinals: any
  isAdmin = false
  isReviewer = false
  isPublisher = false
  departmentData: any
  currentAction: 'author' | 'reviewer' | 'expiry' | 'deleted' = 'author'
  count: any = {}

  editorConfig = {
    context: {
      user: {
        id: 'bf020396-0d7b-436f-ae9f-869c6780fc45',
        name: 'Vaibahv Bhuva',
        orgIds: ['01307938306521497658'],
      },
      identifier: 'do_113232468426096640111',
      authToken: ' ',
      sid: 'iYO2K6dOSdA0rwq7NeT1TDzS-dbqduvV',
      did: '7e85b4967aebd6704ba1f604f20056b6',
      uid: 'bf020396-0d7b-436f-ae9f-869c6780fc45',
      channel: '01307938306521497658',
      pdata: {
        id: 'dev.dock.portal',
        ver: '2.8.0',
        pid: 'creation-portal',
      },
      contextRollup: {
        l1: '01307938306521497658',
      },
      tags: ['01307938306521497658'],
      cdata: [
        {
          id: '01307938306521497658',
          type: 'sourcing_organization',
        },
        {
          type: 'project',
          id: 'ec5cc850-3f71-11eb-aae1-fb99d9fb6737',
        },
        {
          type: 'linked_collection',
          id: 'do_113140468925825024117',
        },
      ],
      timeDiff: 5,
      objectRollup: {
        l1: 'do_113140468925825024117',
        l2: 'do_113140468926914560125',
      },
      host: '',
      defaultLicense: [
        {
          identifier: 'cc-by-4.0',
          lastStatusChangedOn: '2020-03-22T16:03:38.003+0000',
          consumerId: '9f1bd4a1-c617-422b-8d5a-d24c7d3ade2e',
          description: 'For details see below:',
          graph_id: 'domain',
          nodeType: 'DATA_NODE',
          createdOn: '2020-03-22T16:03:38.003+0000',
          url: 'https://creativecommons.org/licenses/by/4.0/legalcode',
          versionKey: '1584893018003',
          objectType: 'License',
          name: 'CC BY 4.0',
          lastUpdatedOn: '2020-03-22T16:03:38.003+0000',
          status: 'Live',
          node_id: 60,
        },
      ],
      endpoint: '/data/v3/telemetry',
      userData: {
        firstName: 'Vaibhav',
        lastName: 'Bhuva',
      },
      env: 'questionSetLibrary',
      framework: 'ekstep_ncert_k-12',
      cloudStorageUrls: ['https://s3.ap-south-1.amazonaws.com/ekstep-public-qa/', 'https://ekstep-public-qa.s3-ap-south-1.amazonaws.com/',
        'https://dockstorage.blob.core.windows.net/sunbird-content-dock/'],
      board: 'CBSE',
      medium: ['English'],
      gradeLevel: ['Class 1'],
      subject: ['Environmental Studies'],
      topic: ['Hello'],
      additionalCategories: [
        {
          value: 'Classroom Teaching Video',
          label: 'Classroom Teaching Video',
        },
        {
          value: 'Concept Map',
          label: 'Concept Map',
        },
        {
          value: 'Curiosity Question Set',
          label: 'Curiosity Question Set',
        },
        {
          value: 'Textbook',
          label: 'Textbook',
        },
        {
          value: 'Experiential Resource',
          label: 'Experiential Resource',
        },
        {
          value: 'Explanation Video',
          label: 'Explanation Video',
        },
        {
          value: 'Focus Spot',
          label: 'Focus Spot',
        },
        {
          value: 'Learning Outcome Definition',
          label: 'Learning Outcome Definition',
        },
        {
          value: 'Marking Scheme Rubric',
          label: 'Marking Scheme Rubric',
        },
        {
          value: 'Pedagogy Flow',
          label: 'Pedagogy Flow',
        },
        {
          value: 'Lesson Plan',
          label: 'Lesson Plan',
        },
        {
          value: 'Previous Board Exam Papers',
          label: 'Previous Board Exam Papers',
        },
        {
          value: 'TV Lesson',
          label: 'TV Lesson',
        },
      ],
      labels: {
        save_collection_btn_label: 'Save as Daft',
      },
    },
    config: {
      mode: 'edit', // edit / review / read
      maxDepth: 0,
      objectType: 'QuestionSet',
      primaryCategory: 'Practice Question Set',
      isRoot: true,
      iconClass: 'fa fa-book',
      children: {
        Question: [
          'Multiple Choice Question',
          'Subjective Question',
        ],
      },
      hierarchy: {},
    },
  }
  showEditor = true
  title = 'sunbird-questionset-editor'

  @ViewChild('searchInput', { static: false }) searchInputElem: ElementRef<any> = {} as ElementRef<
    any
  >
  isLtMedium$ = this.valueSvc.isLtMedium$
  private defaultSideNavBarOpenedSubscription: any
  mode$ = this.isLtMedium$.pipe(map(isMedium => (isMedium ? 'over' : 'side')))
  public screenSizeIsLtMedium = false
  leftmenues!: ILeftMenu
  public filterMenuItems: any = []
  /* tslint:disable */
  courseTaken = _.get(this.activatedRoute, 'snapshot.data.courseTaken.data')
  resourses: any
  dataSource: any
  hasChild = (_: number, node: IMenuFlatNode) => node.expandable

  private _transformer = (node: IFilterMenuNode, level: number) => {
    return {
      expandable: !!node.values && node.values.length > 0,
      displayName: node.name,
      checked: node.checked,
      type: node.name,
      count: node.count ? node.count : 0,
      levels: level,
    }
  }
  /* tslint:enable */

  constructor(
    private myContSvc: MyContentService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private loadService: LoaderService,
    private accessService: AccessControlService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private authInitService: AuthInitService,
    // private durationPipe: PipeDurationTransformPipe,
    private valueSvc: ValueService,
    private configService: ConfigurationsService,

  ) {
    this.courseTaken = {
      mandatoryCourseCompleted: true,
    }
    this.isAdmin = this.accessService.hasRole(['admin', 'super-admin', 'content-admin', 'editor', 'content-creator'])
    this.isReviewer = this.accessService.hasRole(['reviewer'])
    this.isPublisher = this.accessService.hasRole(['publisher'])
    if (this.configService.userRoles) {
      this.myRoles = this.configService.userRoles
    }
    if (this.activatedRoute.snapshot.data.departmentData) {
      this.departmentData = this.activatedRoute.snapshot.data.departmentData
    }
    this.filterMenuTreeControl = new FlatTreeControl<IMenuFlatNode>(
      node => node.levels,
      node => node.expandable,
    )
    this.filterMenuTreeFlattener = new MatTreeFlattener(
      this._transformer,
      node => node.levels,
      node => node.expandable,
      node => node.values,
    )
    this.dataSource = new MatTreeFlatDataSource(
      this.filterMenuTreeControl,
      this.filterMenuTreeFlattener,
    )
    this.dataSource.data = this.filterMenuItems
    this.userId = this.accessService.userId

    if (this.departmentData) {
      const leftData = this.authInitService.authAdditionalConfig.menus
      _.set(leftData, 'widgetData.logo', true)
      _.set(leftData, 'widgetData.logoPath', _.get(this.activatedRoute, 'snapshot.data.departmentData.data.logo'))
      _.set(leftData, 'widgetData.name', _.get(this.activatedRoute, 'snapshot.data.departmentData.data.deptName'))
      _.set(leftData, 'widgetData.userRoles', this.myRoles)
      this.leftmenues = leftData
    } else {
      this.leftmenues = this.authInitService.authAdditionalConfig.menus
    }
    this.isAdmin = this.accessService.hasRole(['admin', 'super-admin', 'content-admin', 'editor'])
    // if (this.courseTaken.mandatoryCourseCompleted) {
    this.initCardTable()
    // } else {
    //   this.resourses = _.map(this.courseTaken.contentDetails, (v, k) => {
    //     return { key: k, ...v }
    //   })
    // }
  }

  editorEventListener(event: any) {
    this.showEditor = false
    console.log(event)
  }

  initCardTable() {
    this.tableData = {
      columns: [
        {
          displayName: 'Course Name', key: 'name', isList: false, prop: '',
          link: { path: '/author/content-detail/', dParams: 'identifier' },
          defaultValue: 'Untitled Content',
          image: 'appIcon',
        },
        { displayName: 'Kind', key: 'contentType', isList: false, prop: '', defaultValue: 'NA', pipe: PipeContentTypePipe },
        // { displayName: 'Active users', key: 'uniqueUsersCount', isList: false, prop: '', defaultValue: 0 },
        { displayName: 'Duration', key: 'duration', defaultValue: 0, pipe: PipeDurationTransformPipe },
      ], //  :> this will load from json
      actions: [], // :> this will load from json
      needCheckBox: false,
      needHash: false,
      sortColumn: 'name',
      sortState: 'asc',
      actionsMenu: {
        headIcon: 'apps',
        menus: [
          { name: 'Edit', action: 'edit', disabled: false, icon: 'edit' },
          { name: 'Delete', action: 'delete', disabled: false, icon: 'delete' },
        ],
        rowIcon: 'more_vert',
      },
    }
  }
  ngOnDestroy() {
    if (this.routerSubscription.unsubscribe) {
      this.routerSubscription.unsubscribe()
    }
    if (this.defaultSideNavBarOpenedSubscription) {
      this.defaultSideNavBarOpenedSubscription.unsubscribe()
    }
    this.loadService.changeLoad.next(false)
  }

  ngOnInit() {
    this.pagination = {
      offset: 0,
      limit: 24,
    }
    this.newDesign = _.get(this.accessService, 'authoringConfig.newDesign')
    this.ordinals = this.authInitService.ordinals
    this.allLanguages = this.authInitService.ordinals.subTitles || []
    this.defaultSideNavBarOpenedSubscription = this.isLtMedium$.subscribe(isLtMedium => {
      this.sideNavBarOpenedMain = !isLtMedium
      this.screenSizeIsLtMedium = isLtMedium
    })
    this.activatedRoute.queryParams.subscribe(params => {
      this.status = params.status || 'published'
      this.setAction()
      this.fetchContent(false)
    })
  }

  createNewComponent() {
    this.router.navigate(['author', 'editor', 'new', 'collection'])
  }

  fetchStatus() {
    switch (this.status) {
      case 'draft':
      case 'rejected':
        return ['Draft']
      case 'inreview':
        return ['Review', 'QualityReview']
      case 'review':
        return ['InReview']
      case 'published':
      case 'expiry':
        return ['Live']
      case 'publish':
        return ['Reviewed']
      case 'processing':
        return ['Processing']
      case 'unpublished':
        return ['Unpublished']
      case 'deleted':
        return ['Deleted']
    }
    return ['Draft']
  }

  setAction() {
    switch (this.status) {
      case 'draft':
      case 'rejected':
      case 'inreview':
      case 'review':
      case 'published':
      case 'publish':
      case 'processing':
      case 'unpublished':
      case 'deleted':
        this.currentAction = 'author'
        break
      case 'expiry':
        this.currentAction = 'expiry'
        break
    }
  }
  actionClick(event: any) {
    if (event) {
      switch (event.action) {
        case 'edit':
        case 'delete':
          this.action({ type: event.action, data: event.data })
          break
        default:
          break
      }
    }
  }
  fetchContent(loadMoreFlag: boolean, changeFilter = true) {
    const searchV6Data = this.myContSvc.getSearchBody(
      this.status,
      this.searchLanguage ? [this.searchLanguage] : [],
      loadMoreFlag ? this.pagination.offset : 0,
      this.queryFilter,
      this.isAdmin,
    )
    let isUserRecordEnabled = true
    const adminOnlyRoles = this.accessService.hasRole(['admin', 'super-admin', 'content-admin', 'editor', 'content-creator'])
    if (adminOnlyRoles && isUserRecordEnabled) {
      isUserRecordEnabled = true
    } else if (this.accessService.hasRole(['reviewer', 'publisher'])) {
      isUserRecordEnabled = false
    }
    const requestData = {
      locale: this.searchLanguage ? [this.searchLanguage] : ['en'],
      query: this.queryFilter,
      request: {
        query: this.queryFilter,
        filters: {
          status: this.fetchStatus(),
          // creatorContacts: <string[]>[],
          // trackContacts: <string[]>[],
          // publisherDetails: <string[]>[],
          // isMetaEditingDisabled: [false],
          // isContentEditingDisabled: [false]
        },
        // pageNo: loadMoreFlag ? this.pagination.offset : 0,
        sort_by: { lastUpdatedOn: 'desc' },
        // pageSize: this.pagination.limit,
        fields: [
          'name',
          'appIcon',
          'mimeType',
          'gradeLevel',
          'identifier',
          'medium',
          'pkgVersion',
          'board',
          'subject',
          'resourceType',
          'primaryCategory',
          'contentType',
          'channel',
          'organisation',
          'trackable',
          'status',
          'authoringDisabled',
        ],
        facets: [
          'primaryCategory',
          'mimeType',
        ],
        // pageNo: loadMoreFlag ? this.pagination.offset : 0,
        // sort: [{ lastUpdatedOn: 'desc' }],
        // pageSize: this.pagination.limit,
        // uuid: this.userId,
        // rootOrg: this.accessService.rootOrg,
        // // this is for Author Only
        // isUserRecordEnabled: true,
      },
    }
    if (this.finalFilters.length) {
      this.finalFilters.forEach((v: any) => {
        searchV6Data.filters.forEach((filter: any) => {
          filter.andFilters[0] = {
            ...filter.andFilters[0],
            [v.key]: v.value,
          }
        })
        requestData.request.filters = { ...requestData.request.filters, [v.key]: v.value }
      })
    }
    // if (this.queryFilter) {
    //   // tslint:disable
    //   delete requestData.request.sort
    //   // tslint:enable
    // }
    // if (
    //   [
    //     'draft',
    //     'rejected',
    //     'inreview',
    //     'published',
    //     'unpublished',
    //     'processing',
    //     'deleted',
    //   ].indexOf(this.status) > -1 &&
    //   !this.isAdmin
    // ) {
    //   requestData.request.filters.creatorContacts.push(this.userId)
    // }
    // if (this.status === 'review' && !this.isAdmin) {
    //   requestData.request.filters.trackContacts.push(this.userId)
    // }
    // if (this.status === 'publish' && !this.isAdmin) {
    //   requestData.request.filters.publisherDetails.push(this.userId)
    // }

    this.loadService.changeLoad.next(true)
    const observable =
      this.status === 'expiry' || this.newDesign
        ? this.myContSvc.fetchFromSearchV6(searchV6Data, this.isAdmin).pipe(
          map((v: any) => {
            return {
              result: {
                response: v,
              },
            }
          }),
        )
        : this.myContSvc.fetchContent(requestData)
    this.loadService.changeLoad.next(true)
    observable.subscribe(
      data => {
        this.loadService.changeLoad.next(false)
        if (changeFilter) {
          this.filterMenuItems =
            data && data.result && data.result.facets
              ? data.result.facets
              : this.filterMenuItems
          this.dataSource.data = this.filterMenuItems
        }
        this.cardContent =
          loadMoreFlag && !this.queryFilter
            ? (this.cardContent || []).concat(
              data && data.result ? data.result.content : [],
            )
            : data && data.result.content
              ? data.result.content
              : []
        this.totalContent = data && data.result ? data.result.count : 0
        // const index = _.findIndex(this.count, i => i.n === this.status)
        // if (index >= 0) {
        this.count[this.status] = this.totalContent
        // }
        this.showLoadMore =
          this.pagination.offset * this.pagination.limit + this.pagination.limit < this.totalContent
            ? true
            : false
        this.fetchError = false
      },
      () => {
        this.fetchError = true
        this.cardContent = []
        this.showLoadMore = false
        this.loadService.changeLoad.next(false)
      },
    )
  }
  getTableData(): any[] {
    if (this.cardContent && this.cardContent.length > 0) {
      return _.map(this.cardContent, i => {
        // const duration = this.durationPipe.transform(i.duration || 0, 'hms') || '0'
        // i.duration = duration
        return i
      })
    }
    return []
  }
  search() {
    if (this.searchInputElem.nativeElement) {
      this.queryFilter = this.searchInputElem.nativeElement.value.trim()
    }
    this.fetchContent(false, false)
  }

  filterApplyEvent(node: any) {
    this.pagination.offset = 0
    this.sideNavBarOpened = false
    const filterIndex = this.filters.findIndex(v => v.displayName === node.displayName)
    const filterMenuItemsIndex = this.filterMenuItems.findIndex((obj: any) =>
      obj.values.some((val: any) => val.name === node.type)
    )
    const ind = this.finalFilters.indexOf(this.filterMenuItems[filterMenuItemsIndex].name)
    if (filterIndex === -1 && node.checked) {
      this.filters.push(node)
      this.filterMenuItems[filterMenuItemsIndex].values.find(
        (v: any) => v.name === node.displayName ,
      ).checked = true

      if (ind === -1) {
        this.finalFilters.push({
          key: this.filterMenuItems[filterMenuItemsIndex].name,
          value: [node.type],
        })
      } else {
        this.finalFilters[ind].value.push(node.type)
        // this.finalFilters.push({
        //   key: node.displayName,
        //   value: [node.type],
        // })
      }
    } else {
      this.filterMenuItems[filterMenuItemsIndex].values.find(
        (v: any) => v.name === node.displayName,
      ).checked = false
      this.filters.splice(filterIndex, 1)
      this.finalFilters.splice(ind, 1)
    }
    this.dataSource.data = this.filterMenuItems
    this.fetchContent(false, false)
  }

  deleteContent(request: NSContent.IContentMeta) {
    this.loadService.changeLoad.next(true)
    this.myContSvc
      .deleteContent(request.identifier, request.contentType === 'Knowledge Board')
      .subscribe(
        () => {
          this.loadService.changeLoad.next(false)
          this.snackBar.openFromComponent(NotificationComponent, {
            data: {
              type: Notify.SUCCESS,
            },
            duration: NOTIFICATION_TIME * 1000,
          })
          this.cardContent = (this.cardContent || []).filter(
            v => v.identifier !== request.identifier,
          )
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
          this.loadService.changeLoad.next(false)
          this.snackBar.openFromComponent(NotificationComponent, {
            data: {
              type: Notify.CONTENT_FAIL,
            },
            duration: NOTIFICATION_TIME * 1000,
          })
        },
      )
  }

  restoreContent(request: NSContent.IContentMeta) {
    this.loadService.changeLoad.next(true)
    this.myContSvc.restoreContent(request.identifier).subscribe(
      () => {
        this.loadService.changeLoad.next(false)
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.SUCCESS,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
        this.cardContent = (this.cardContent || []).filter(v => v.identifier !== request.identifier)
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
        this.loadService.changeLoad.next(false)
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.CONTENT_FAIL,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
      },
    )
  }

  createContent(request: NSContent.IContentMeta) {
    this.loadService.changeLoad.next(true)
    this.myContSvc.createInAnotherLanguage(request.identifier, request.locale).subscribe(
      (id: string) => {
        this.loadService.changeLoad.next(false)
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
            width: '750px',
            height: '450px',
            data: {
              errorFromBackendData: error.error,
            },
          })
        }
        this.loadService.changeLoad.next(false)
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.CONTENT_FAIL,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
      },
    )
  }

  clearAllFilters() {
    this.finalFilters = defaultFilter
    this.searchInputElem.nativeElement.value = ''
    this.queryFilter = ''
    this.filterMenuItems.map((val: any) => val.values.map((v: any) => (v.checked = false)))
    this.dataSource.data = this.filterMenuItems
    this.filters = []
    this.fetchContent(false)
  }

  loadMore() {
    this.pagination.offset += 1
    this.fetchContent(true, false)
  }

  confirmAction(content: any) {
    let message = ''
    if (content.type === 'delete') {
      message = 'delete'
    } else if (content.type === 'restoreDeleted') {
      message = 'restoreDeleted'
    } else if (content.type === 'unpublish') {
      message = 'unpublish'
    } else if (content.type === 'moveToDraft' || content.type === 'moveToInReview') {
      if (content.data.mimeType.indexOf('collection') >= 0) {
        message = 'retrieveParent'
      } else {
        message = 'retrieveChild'
      }
    } else {
      this.forwardBackward(content)
      return
    }
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '600px',
      height: '200px',
      data: message,
    })

    dialogRef.afterClosed().subscribe((confirm: any) => {
      if (confirm) {
        if (content.type === 'delete') {
          this.deleteContent(content.data)
        } else if (content.type === 'restoreDeleted') {
          this.restoreContent(content.data)
        } else if (
          content.type === 'unpublish' ||
          (content.type === 'moveToDraft' && content.data.status === 'Unpublished')
        ) {
          this.unPublishOrDraft(content.data)
        } else {
          this.forwardBackward(content)
        }
      }
    })
  }

  unPublishOrDraft(request: NSContent.IContentMeta) {
    this.loadService.changeLoad.next(true)
    this.myContSvc.upPublishOrDraft(request.identifier, request.status !== 'Unpublished').subscribe(
      () => {
        this.loadService.changeLoad.next(false)
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.SUCCESS,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
        this.cardContent = (this.cardContent || []).filter(v => v.identifier !== request.identifier)
      },
      error => {
        if (error.status === 409) {
          this.dialog.open(ErrorParserComponent, {
            width: '750px',
            height: '450px',
            data: {
              errorFromBackendData: error.error,
            },
          })
        }
        this.loadService.changeLoad.next(false)
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.CONTENT_FAIL,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
      },
    )
  }

  forwardBackward(content: any) {
    const dialogRef = this.dialog.open(CommentsDialogComponent, {
      width: '750px',
      height: '450px',
      data: { ...content.data, status: 'Draft' },
    })

    dialogRef.afterClosed().subscribe((commentsForm: FormGroup) => {
      if (commentsForm) {
        this.finalCall(commentsForm, content)
      }
    })
  }

  finalCall(commentsForm: FormGroup, content: any) {
    if (commentsForm) {
      let operationValue: any
      switch (content.type) {
        case 'moveToDraft':
          operationValue = 0
          break
        case 'moveToInReview':
          operationValue = -1
          break
      }
      const body: NSApiRequest.IForwardBackwardActionGeneral = {
        comment: commentsForm.controls.comments.value,
        operation: operationValue,
      }
      this.loadService.changeLoad.next(true)
      this.myContSvc.forwardBackward(body, content.data.identifier, content.data.status).subscribe(
        () => {
          this.loadService.changeLoad.next(false)
          this.snackBar.openFromComponent(NotificationComponent, {
            data: {
              type: Notify.SUCCESS,
            },
            duration: NOTIFICATION_TIME * 1000,
          })
          this.cardContent = (this.cardContent || []).filter(
            v => v.identifier !== content.data.identifier,
          )
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
          this.loadService.changeLoad.next(false)
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

  action(event: { data: NSContent.IContentMeta; type: string }) {
    switch (event.type) {
      case 'create':
        this.createContent(event.data)
        break

      case 'review':
      case 'publish':
      case 'edit':
        // need to check edit of published content
        this.router.navigateByUrl(`/author/editor/${event.data.identifier}`)
        break
      case 'remove':
        this.cardContent = (this.cardContent || []).filter(
          v => v.identifier !== event.data.identifier,
        )
        break
      case 'moveToInReview':
      case 'moveToDraft':
      case 'delete':
      case 'unpublish':
      case 'restoreDeleted':
        this.confirmAction(event)
        break
      case 'expiryExtend':
        this.actionOnExpiry(event.data)
    }
  }

  actionOnExpiry(content: NSContent.IContentMeta) {
    const dialogRef = this.dialog.open(AuthExpiryDateConfirmComponent, {
      width: '750px',
      height: '300px',
      data: content,
    })

    dialogRef.afterClosed().subscribe((userAction?: { isExtend: boolean; expiryDate?: string }) => {
      if (userAction) {
        this.cardContent = (this.cardContent || []).filter(v => v.identifier !== content.identifier)
      }
    })
  }

  setCurrentLanguage(lang: string) {
    this.searchLanguage = lang
  }
}
