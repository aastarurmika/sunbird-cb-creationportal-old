import { Injectable } from '@angular/core'
import { NsAutoComplete, UserAutocompleteService } from '@ws-widget/collection'
import { ConfigurationsService } from '@ws-widget/utils'
import {
  AUTHORING_CONTENT_BASE,
  CONTENT_BASE_COPY,
  // CONTENT_CREATE,
  CONTENT_DELETE,
  CONTENT_READ,
  CONTENT_SAVE,
  CONTENT_SAVE_V2,
  SEARCH,
  STATUS_CHANGE,
  SEARCH_V6_ADMIN,
  SEARCH_V6_AUTH,
  CONTENT_READ_HIERARCHY_AND_DATA,
  AUTHORING_BASE,
  SEND_TO_REVIEW,
  PUBLISH_CONTENT,
  REJECT_CONTENT,
  EMAIL_NOTIFICATION,
} from '@ws/author/src/lib/constants/apiEndpoints'
import { NSApiResponse } from '@ws/author/src/lib/interface//apiResponse'
import { NSApiRequest } from '@ws/author/src/lib/interface/apiRequest'
import { NSContent } from '@ws/author/src/lib/interface/content'
import { AccessControlService } from '@ws/author/src/lib/modules/shared/services/access-control.service'
import { ApiService } from '@ws/author/src/lib/modules/shared/services/api.service'
import { EMPTY, Observable, of } from 'rxjs'
import { map, mergeMap, catchError } from 'rxjs/operators'
import { CONTENT_READ_MULTIPLE_HIERARCHY } from './../../../../constants/apiEndpoints'
import { ISearchContent, ISearchResult } from '../../../../interface/search'
import { environment } from '../../../../../../../../../src/environments/environment'
// import { HttpHeaders } from '@angular/common/http'

@Injectable()
export class EditorService {
  accessPath: string[] = []
  newCreatedLexid!: string
  constructor(
    private apiService: ApiService,
    private accessService: AccessControlService,
    private userAutoComplete: UserAutocompleteService,
    private configSvc: ConfigurationsService,
  ) { }

  create(meta: NSApiRequest.ICreateMetaRequestGeneral): Observable<string> {
    const requestBody: NSApiRequest.ICreateMetaRequest = {
      content: {
        locale: 'en',
        isExternal: false,
        authoringDisabled: false,
        isMetaEditingDisabled: false,
        isContentEditingDisabled: false,
        category: meta.contentType,
        ...meta,
        createdBy: this.accessService.userId,
      },
    }
    if (this.accessService.rootOrg === 'client2') {
      if (meta.contentType === 'Knowledge Artifact') {
        try {
          const userPath = `client2/Australia/dealer_code-${this.configSvc.unMappedUser.json_unmapped_fields.dealer_group_code}`
          requestBody.content.accessPaths = userPath
        } catch {
          requestBody.content.accessPaths = 'client2'
        }
      } else {
        requestBody.content.accessPaths = 'client2'
      }
    }
    return this.apiService
      .post<NSApiRequest.ICreateMetaRequest>(
        // tslint:disable-next-line:max-line-length
        // `${CONTENT_CREATE}${this.accessService.orgRootOrgAsQuery}`,
        `${AUTHORING_BASE}content/v3/create`,
        requestBody,
      )
      .pipe(
        map((data: NSApiResponse.IContentCreateResponse) => {
          return data.identifier
        }),
      )
  }

  createV2(meta: NSApiRequest.ICreateMetaRequestGeneralV2): Observable<string> {
    let randomNumber = ''
    // tslint:disable-next-line: no-increment-decrement
    for (let i = 0; i < 16; i++) {
      randomNumber += Math.floor(Math.random() * 10)
    }
    const requestBody: NSApiRequest.ICreateMetaRequestV2 = {
      request: {
        content: {
          code: randomNumber,
          contentType: meta.contentType,
          createdBy: this.accessService.userId,
          createdFor: [(this.configSvc.userProfile && this.configSvc.userProfile.rootOrgId) ? this.configSvc.userProfile.rootOrgId : ''],
          creator: this.accessService.userName,
          description: '',
          framework: environment.framework,
          mimeType: meta.mimeType,
          name: meta.name,
          // organisation: [environment.organisation],
          organisation: [
            (this.configSvc.userProfile && this.configSvc.userProfile.departmentName) ? this.configSvc.userProfile.departmentName : '',
          ],
          isExternal: meta.mimeType === 'application/html',
          primaryCategory: meta.primaryCategory,
          license: 'CC BY 4.0',
          ownershipType: ['createdFor'],
          purpose: (meta.purpose) ? meta.purpose : '',
        },
      },
    }
    return this.apiService
      .post<NSApiRequest.ICreateMetaRequestV2>(
        // tslint:disable-next-line:max-line-length
        `${AUTHORING_BASE}content/v3/create`,
        requestBody,
      )
      .pipe(
        map((data: NSApiResponse.IContentCreateResponseV2) => {
          return data.result.identifier
        }),
      )
  }

  readContent(id: string): Observable<NSContent.IContentMeta> {
    this.newCreatedLexid = id
    return this.apiService.get<NSContent.IContentMeta>(
      `${CONTENT_READ}${id}${this.accessService.orgRootOrgAsQuery}`,
    )
  }

  readContentV2(id: string): Observable<NSContent.IContentMeta> {
    this.newCreatedLexid = id
    return this.apiService.get<NSContent.IContentMeta>(
      `${AUTHORING_BASE}content/v3/read/${id}?mode=edit`,
    ).pipe(
      map((data: any) => {
        return data.result.content
      })
    )
  }

  readcontentV3(id: string): Observable<NSContent.IContentMeta> {
    return this.apiService.get<NSContent.IContentMeta>(
      `/apis/proxies/v8/action/content/v3/hierarchy/${id}?mode=edit`
    ).pipe(
      map((data: any) => {
        return data.result.content
      })
    )
  }

  createAndReadContentV2(
    meta: NSApiRequest.ICreateMetaRequestGeneralV2,
  ): Observable<NSContent.IContentMeta> {
    return this.createV2(meta).pipe(mergeMap(data => this.readContentV2(data)))
  }

  readMultipleContent(ids: string[]): Observable<NSContent.IContentMeta[]> {
    return this.apiService.get<NSContent.IContentMeta>(
      `${CONTENT_READ_MULTIPLE_HIERARCHY}${ids.join()}`,
    )
  }

  createAndReadContent(
    meta: NSApiRequest.ICreateMetaRequestGeneral,
  ): Observable<NSContent.IContentMeta> {
    return this.create(meta).pipe(mergeMap(data => this.readContent(data)))
  }

  updateContent(meta: NSApiRequest.IContentUpdate): Observable<null> {
    return this.apiService.post<null>(
      `${CONTENT_SAVE}${this.accessService.orgRootOrgAsQuery}`,
      meta,
    )
  }

  updateContentV2(meta: NSApiRequest.IContentUpdate): Observable<null> {
    return this.apiService.post<null>(
      `${CONTENT_SAVE_V2}${this.accessService.orgRootOrgAsQuery}`,
      meta,
    )
  }
  rejectContentApi(requestPayload: any, id: string): Observable<null> {
    return this.apiService.post<any>(REJECT_CONTENT + id, requestPayload)
  }

  updateContentV3(meta: NSApiRequest.IContentUpdateV2, id: string): Observable<null> {
    return this.apiService.patch<null>(
      // `${AUTHORING_BASE}content/v3/update/${id}`,
      `/apis/proxies/v8/action/content/v3/update/${id}`,
      meta,
    )
  }

  updateContentV4(meta: NSApiRequest.IContentUpdateV3): Observable<null> {
    return this.apiService.patch<null>(
      `/apis/proxies/v8/action/content/v3/hierarchy/update`,
      meta,
    )
  }

  updateContentWithFewFields(requestBody: any, identifier: string): Observable<any> {
    return this.apiService.patch<any>(
      `/apis/proxies/v8/action/content/v3/update/${identifier}`,
      requestBody,
    )
  }

  updateContentForReviwer(requestBody: any, identifier: string): Observable<any> {
    return this.apiService.patch<any>(
      `/apis/proxies/v8/action/content/v3/updateReviewStatus/${identifier}`,
      requestBody
    )
  }

  updateHierarchyForReviwer(meta: NSApiRequest.IContentUpdateV3): Observable<any> {
    return this.apiService.patch<null>(
      `/apis/proxies/v8/action/content/v3/hierarchyUpdate`,
      meta,
    )
  }

  fetchEmployeeList(data: string, roleType?: string): Observable<any[]> {
    // return this.userAutoComplete.fetchAutoComplete(data).pipe(
    return this.userAutoComplete.fetchAutoCompleteV2(data, roleType).pipe(
      map((v: NsAutoComplete.IUserAutoComplete[]) => {
        return v.map(user => {
          return {
            displayName: `${user.first_name || ''} ${user.last_name || ''}`,
            id: user.wid,
            mail: user.email,
            department: user.department_name,
          }
        })
      }),
      catchError(_ => of([])),
    )
  }

  searchSkills(query: string): Observable<any> {
    return this.apiService.get(`/LA/api/search?search_text=${query}&type=skill`).pipe(
      map((v: any) =>
        v.map((val: any) => {
          return {
            identifier: val.identifier,
            name: val.name,
            skill: val.skill,
            category: val.category,
          }
        }),
      ),
    )
  }

  searchV6Content(query = '*', locale: string): Observable<ISearchContent[]> {
    return this.apiService
      .post<ISearchResult>(
        this.accessService.hasRole(['editor', 'admin']) ? SEARCH_V6_ADMIN : SEARCH_V6_AUTH,
        {
          query: query || '*',
          locale: [locale],
          pageSize: 20,
          pageNo: 0,
          filters: [
            {
              andFilters: [
                {
                  status: ['Live'],
                  contentType: ['Course', 'Collection', 'Learning Path', 'Resource'],
                },
              ],
            },
          ],
          uuid: this.accessService.userId,
          rootOrg: this.accessService.rootOrg,
        },
      )
      .pipe(
        map(v => (v && v.result ? v.result : [])),
        catchError(_ => of([])),
      )
  }

  checkUrl(url: string): Observable<any> {
    return this.apiService.get<any>(url)
  }

  forwardBackward(
    meta: NSApiRequest.IForwardBackwardActionGeneral,
    id: string,
    status: string,
  ): Observable<null> {

    const requestBody: NSApiRequest.IForwardBackwardAction = {
      actor: this.accessService.userId,
      ...meta,
      org: this.accessService.org,
      rootOrg: this.accessService.rootOrg || '',
      appName: this.accessService.appName,
      appUrl: window.location.origin,
      actorName: this.accessService.userName,
      action: this.accessService.getAction(status, meta.operation),
    }
    return this.apiService.post<null>(STATUS_CHANGE + id, requestBody)
  }

  // sendToReview(id: string, status: string, parentStatus: string) {
  //   if (status === 'Review' && parentStatus === 'Review') {
  //     // tslint:disable-next-line: no-shadowed-variable
  //     const requestbody = {
  //       request: {
  //         content: {
  //           publisher: this.accessService.userName,
  //           lastPublishedBy: this.accessService.userName,
  //         },
  //       },
  //     }
  //     return this.apiService.post<any>(PUBLISH_CONTENT + id, requestbody)
  //     // tslint:disable-next-line: no-else-after-return
  //   } else if (parentStatus === 'Draft') {
  //     const requestbody = { }
  //     return this.apiService.post<any>(SEND_TO_REVIEW + id, requestbody)
  //   }
  //   return EMPTY
  // }

  sendToReview(id: string, parentStatus: string) {
    // console.log(parentStatus)
    if (parentStatus === 'Draft') {
      const requestbody = {}
      return this.apiService.post<any>(SEND_TO_REVIEW + id, requestbody)
    }
    return EMPTY
  }

  publishContent(id: string) {
    const requestbody = {
      request: {
        content: {
          publisher: this.accessService.userName,
          lastPublishedBy: this.accessService.userName,
        },
      },
    }
    return this.apiService.post<any>(PUBLISH_CONTENT + id, requestbody)
  }

  readJSON(artifactUrl: string): Observable<any> {
    return this.apiService.get(`${AUTHORING_CONTENT_BASE}${encodeURIComponent(artifactUrl)}`)
  }

  searchContent(searchData: any): Observable<any> {
    return this.apiService
      .post<NSApiResponse.ISearchApiResponse>(SEARCH, searchData)
      .pipe(map((data: NSApiResponse.IApiResponse<NSApiResponse.ISearchApiResponse>) => data))
  }

  checkRole(id: string): Observable<string[]> {
    return this.apiService.get<string[]>(`/apis/protected/V8/user/roles/${id}`).pipe(
      map((v: { default_roles: string[]; user_roles: string[] }) => {
        if (v) {
          let roles: string[] = []
          if (v.default_roles) {
            roles = roles.concat(v.default_roles)
          }
          if (v.user_roles) {
            roles = roles.concat(v.user_roles)
          }
          return roles
        }
        return []
      }),
    )
  }

  getAccessPath(): Observable<string[]> {
    return this.accessPath.length
      ? of()
      : this.apiService.get<string[]>(`/apis/protected/V8/user/accessControl`).pipe(
        map((v: { special: { accessPaths: string[] }[] }) => {
          if (v) {
            v.special.forEach(acc => {
              this.accessPath = this.accessPath.concat(acc.accessPaths)
            })
          }
          return this.accessPath
        }),
      )
  }

  copy(lexId: string, url: string) {
    // tslint:disable-next-line: max-line-length
    const destination = `${this.accessService.rootOrg.replace(
      / /g,
      '_',
    )}%2F${this.accessService.org.replace(/ /g, '_')}%2FPublic%2F${lexId.replace('.img', '')}`
    const location = url.split('/').slice(4, 8).join('%2F')
    return this.apiService.post(
      CONTENT_BASE_COPY,
      {
        destination,
        location,
      },
      false,
    )
  }

  deleteContent(id: string, isKnowledgeBoard = false): Observable<null> {
    return isKnowledgeBoard
      ? this.apiService.delete(`${CONTENT_DELETE}/${id}/kb${this.accessService.orgRootOrgAsQuery}`)
      : this.apiService.post(`${CONTENT_DELETE}${this.accessService.orgRootOrgAsQuery}`, {
        identifier: id,
        author: this.accessService.userId,
        isAdmin: this.accessService.hasRole(['editor', 'admin']),
      })
  }

  getDataForContent(id: string) {
    return this.apiService.get<{ content: NSContent.IContentMeta, data: any }[]>(
      `${CONTENT_READ_HIERARCHY_AND_DATA}${id}`,
    ).pipe(
      catchError((v: any) => {
        return of(v)
      }),
    )
  }

  sendEmailNotificationAPI(requestBody: any): Observable<any> {
    return this.apiService.post<any>(EMAIL_NOTIFICATION, requestBody)
  }

}
