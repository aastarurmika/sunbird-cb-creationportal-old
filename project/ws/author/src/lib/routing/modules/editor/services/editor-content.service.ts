import { Injectable } from '@angular/core'
import { NSContent } from '@ws/author/src/lib/interface/content'
import { AccessControlService } from '@ws/author/src/lib/modules/shared/services/access-control.service'
import { BehaviorSubject, Observable, of } from 'rxjs'
import { tap } from 'rxjs/operators'
import { IConditionsV2 } from './../../../../interface/conditions-v2'
import { IFormMeta } from './../../../../interface/form'
import { AuthInitService } from './../../../../services/init.service'
import { EditorService } from './editor.service'
import { IAssessmentDetails } from '../routing/modules/iap-assessment/interface/iap-assessment.interface'
import { isArray } from 'lodash'
@Injectable()
export class EditorContentService {
  originalContent: { [key: string]: NSContent.IContentMeta } = {}
  upDatedContent: { [key: string]: NSContent.IContentMeta } = {}
  iapContent: { [key: string]: IAssessmentDetails } = {}
  public currentContent!: string
  public parentContent!: string
  public isSubmitted = false
  public changeActiveCont = new BehaviorSubject<string>('')
  public onContentChange = new BehaviorSubject<string>('')

  listOfFiles: { [key: string]: File } = {}
  listOfUpdatedIPR: { [key: string]: boolean } = {}

  constructor(
    private accessService: AccessControlService,
    private editorService: EditorService,
    private authInitService: AuthInitService,
  ) { }

  getListOfFiles() {
    return this.listOfFiles
  }

  updateListOfFiles(id: string, f: File) {
    this.listOfFiles[id] = f
  }

  getListOfUpdatedIPR() {
    return this.listOfUpdatedIPR
  }

  updateListOfUpdatedIPR(id: string, v: boolean) {
    this.listOfUpdatedIPR[id] = v
  }

  removeListOfFilesAndUpdatedIPR(id: string) {
    delete this.listOfFiles[id]
    delete this.listOfUpdatedIPR[id]
  }

  getOriginalMeta(id: string): NSContent.IContentMeta {
    return this.originalContent[id]
  }

  getUpdatedMeta(id: string): NSContent.IContentMeta {
    if (this.originalContent[id] || this.upDatedContent[id]) {
      return JSON.parse(
        JSON.stringify({
          ...this.originalContent[id],
          ...(this.upDatedContent[id] ? this.upDatedContent[id] : {}),
        }),
      )
    } {
      const value = this.getChildData(id)
      if (value) {
        return value
      }
      return JSON.parse(JSON.stringify({}))
    }
  }
  getChildData(id: string): NSContent.IContentMeta | undefined {
    let returnVal: NSContent.IContentMeta | undefined
    const keys = Object.keys(this.originalContent)
    for (let i = 0; i < keys.length; i += 1) {
      if (this.originalContent[keys[i]] && this.originalContent[keys[i]]['children']) {
        const children = this.originalContent[keys[i]]['children']
        for (let j = 0; j <= children.length; j += 1) {
          if (children[j] && children[j]['identifier'] && children[j]['identifier'] === id) {
            returnVal = children[j]
          } else if (children[j] && children[j].children && children[j].children.length > 0) {
            const subChildrens = children[j].children
            for (let k = 0; k <= subChildrens.length; k += 1) {
              if (subChildrens[k] && subChildrens[k].identifier === id) {
                returnVal = subChildrens[k]
              }
            }
          }
        }
      }
    }
    return returnVal
  }

  setOriginalMeta(meta: NSContent.IContentMeta) {

    this.originalContent[meta.identifier] = JSON.parse(JSON.stringify(meta))
  }

  resetOriginalMeta(meta: NSContent.IContentMeta, id: string) {
    this.originalContent[id] = { ...this.originalContent[id], ...JSON.parse(JSON.stringify(meta)) }
    delete this.upDatedContent[id]
  }

  resetVersionKey(versionKey: number, id: string) {
    this.originalContent[id].versionKey = versionKey
  }

  cleanProperties(objParam: any) {
    const propertiesTobeExcluded: any = []
    const obj = { ...objParam }
    let propNames = Object.getOwnPropertyNames(obj)
    propNames = propNames.filter(el => !propertiesTobeExcluded.includes(el))
    for (const prop of propNames) {
      const propName = prop
      // tslint:disable-next-line: max-line-length
      if (obj[propName] === null || obj[propName] === undefined || obj[propName] === '' || (isArray(obj[propName]) && obj[propName].length === 0)) {
        delete obj[propName]
      }
    }
    return obj
  }

  resetStatus() {
    let isDraftPresent
    Object.keys(this.originalContent).map(v => {
      isDraftPresent = this.originalContent[v].status === 'Draft'
    })
    return isDraftPresent
  }
  changeStatusDraft() {
    Object.keys(this.originalContent).map(v => {
      this.originalContent[v].status = 'Draft'
    })
  }

  resetOriginalMetaWithHierarchy(meta: any) {
    meta.creatorContacts =
      this.jsonVerify(meta.creatorContacts) ? JSON.parse(meta.creatorContacts) : []
    meta.trackContacts =
      this.jsonVerify(meta.reviewer) ? JSON.parse(meta.reviewer) : []
    meta.creatorDetails =
      this.jsonVerify(meta.creatorDetails) ? JSON.parse(meta.creatorDetails) : []
    meta.publisherDetails = this.jsonVerify(meta.publisherDetails) ?
      JSON.parse(meta.publisherDetails) : []
    this.originalContent[meta.identifier] = meta
    if (meta.children && meta.children.length > 0) {
      meta.children.forEach((element: any) => {
        this.resetOriginalMetaWithHierarchy(element)
      })
    }
  }

  // setUpdatedMeta(meta: NSContent.IContentMeta, id: string, emit = true) {
  //   this.upDatedContent[id] = {
  //     ...(this.upDatedContent[id] ? this.upDatedContent[id] : {}),
  //     ...JSON.parse(JSON.stringify(meta)),
  //   }
  //   this.setOriginalMeta(meta)
  //   if (emit) {
  //     this.onContentChange.next(id)
  //   }
  // }

  setUpdatedMeta(meta: NSContent.IContentMeta, id: string, emit = true) {
    this.upDatedContent[id] = {
      ...(this.upDatedContent[id] ? this.upDatedContent[id] : {}),
      ...JSON.parse(JSON.stringify(meta)),
    }

    if (Object.keys(meta).length === 0) { // empty
      this.setOriginalMeta(meta)
    } else {
      this.originalContent[id] = {
        ...(this.originalContent[id] ? this.originalContent[id] : {}),
        ...JSON.parse(JSON.stringify(meta)),
      }
    }
    if (emit) {
      this.onContentChange.next(id)
    }
  }

  setIapContent(meta: IAssessmentDetails, id: string) {
    this.iapContent[id] = {
      ...(this.iapContent[id] ? this.iapContent[id] : {}),
      ...JSON.parse(JSON.stringify(meta)),
    }
  }
  getIapContent(id: string): IAssessmentDetails {
    return this.iapContent[id]
  }

  reset() {
    this.originalContent = {}
    this.currentContent = ''
    this.isSubmitted = false
  }

  hasAccess(
    meta: NSContent.IContentMeta,
    forPreview = false,
    parentMeta?: NSContent.IContentMeta,
  ): boolean {
    return this.accessService.hasAccess(meta, forPreview, parentMeta)
  }

  isLangPresent(lang: string): boolean {
    let isPresent = false
    Object.keys(this.originalContent).map(v => {
      isPresent = this.originalContent[v].locale === lang
    })
    return isPresent
  }

  private getParentUpdatedMeta(): NSContent.IContentMeta {
    const meta = {} as any
    const parentMeta = this.getUpdatedMeta(this.parentContent)
    Object.keys(this.authInitService.authConfig).map(v => {
      // tslint:disable-next-line: no-console

      meta[v as keyof NSContent.IContentMeta] = parentMeta[v as keyof NSContent.IContentMeta]
        ? parentMeta[v as keyof NSContent.IContentMeta]
        : JSON.parse(
          JSON.stringify(
            this.authInitService.authConfig[v as keyof IFormMeta].defaultValue[
              parentMeta.contentType
              // tslint:disable-next-line: ter-computed-property-spacing
            ][0].value,
          ),
        )
    })
    return meta
  }

  parentUpdatedMeta() {
    return this.getParentUpdatedMeta()
  }
  createInAnotherLanguage(
    language: string,
    meta = {},
  ): Observable<NSContent.IContentMeta | boolean> {
    const parentContent = this.getParentUpdatedMeta()
    if (this.isLangPresent(language)) {
      return of(true)
    }
    const requestBody = {
      ...parentContent,
      name: 'Untitled Content',
      description: '',
      subTitle: '',
      body: '',
      thumbnail: '',
      posterImage: '',
      appIcon: '',
      locale: language,
      isTranslationOf: this.parentContent,
      ...meta,
    }
    delete requestBody.identifier
    delete requestBody.status
    delete requestBody.categoryType
    delete requestBody.accessPaths
    return this.editorService
      .createAndReadContent(requestBody)
      .pipe(tap(v => this.setOriginalMeta(v)))
  }

  isValid(id: string): boolean {
    let isValid = true
    const arr = ['competencies', 'draftImage', 'source', 'purpose', 'appIcon', 'license']

    Object.keys(this.authInitService.authConfig).map(v => {
      if (!arr.includes(v)) {
        if (this.checkCondition(id, v, 'required') && !this.isPresent(v, id)) {
          // console.log('checkCondition  ', v)
          isValid = true
        }
      }
    })
    return isValid
  }

  checkCondition(id: string, meta: string, type: 'show' | 'required' | 'disabled'): boolean {
    let returnValue = false
    try {
      const data = this.getUpdatedMeta(id)
      let directType: 'showFor' | 'mandatoryFor' | 'disabledFor'
      let counterType: 'notShowFor' | 'notMandatoryFor' | 'notDisabledFor'
      switch (type) {
        case 'show':
          directType = 'showFor'
          counterType = 'notShowFor'
          break
        case 'required':
          directType = 'mandatoryFor'
          counterType = 'notMandatoryFor'
          break
        default:
          directType = 'disabledFor'
          counterType = 'notDisabledFor'
          break
      }
      if (
        !this.authInitService.authConfig[meta as keyof IFormMeta] ||
        !this.authInitService.authConfig[meta as keyof IFormMeta][directType][data.contentType]
      ) {
        returnValue = false
      } else if (
        this.authInitService.authConfig[meta as keyof IFormMeta][directType][data.contentType] &&
        this.authInitService.authConfig[meta as keyof IFormMeta][directType][data.contentType]
          .length === 0
      ) {
        returnValue = true
      } else {
        this.authInitService.authConfig[meta as keyof IFormMeta][directType][data.contentType].map(
          condition => {
            let childReturnValue = false
            Object.keys(condition).map(childMeta => {
              if (
                condition[childMeta as keyof typeof condition].indexOf(true) > -1 &&
                this.isPresent(childMeta, id)
              ) {
                childReturnValue = true
              } else if (
                condition[childMeta as keyof typeof condition].indexOf(
                  data[childMeta as keyof NSContent.IContentMeta],
                ) > -1
              ) {
                childReturnValue = true
              }
            })
            if (childReturnValue) {
              returnValue = true
            }
          },
        )
      }
      if (
        this.authInitService.authConfig[meta as keyof IFormMeta] &&
        this.authInitService.authConfig[meta as keyof IFormMeta][counterType][data.contentType] &&
        this.authInitService.authConfig[meta as keyof IFormMeta][counterType][data.contentType]
          .length === 0
      ) {
        returnValue = false
      } else if (
        this.authInitService.authConfig[meta as keyof IFormMeta] &&
        this.authInitService.authConfig[meta as keyof IFormMeta][counterType][data.contentType] &&
        this.authInitService.authConfig[meta as keyof IFormMeta][counterType][data.contentType]
          .length > 0
      ) {
        this.authInitService.authConfig[meta as keyof IFormMeta][counterType][data.contentType].map(
          condition => {
            let childReturnValue = false
            Object.keys(condition).map(childMeta => {
              if (
                condition[childMeta as keyof typeof condition].indexOf(true) > -1 &&
                this.isPresent(childMeta, id)
              ) {
                childReturnValue = true
              } else if (
                condition[childMeta as keyof typeof condition].indexOf(
                  data[childMeta as keyof NSContent.IContentMeta],
                ) > -1
              ) {
                childReturnValue = true
              }
            })
            if (childReturnValue) {
              returnValue = false
            }
          },
        )
      }
    } catch (ex) {
      // tslint:disable-next-line: no-console
      // console.log(ex);
      returnValue = false
    }
    return returnValue
  }

  isPresent(meta: string, id: string): boolean {
    let returnValue = false
    const data = this.getUpdatedMeta(id)[meta as keyof NSContent.IContentMeta]
    switch (this.authInitService.authConfig[meta as keyof IFormMeta].type) {
      case 'array':
      case 'string':
        returnValue = data && (data as any).length ? true : false
        break
      case 'object':
      case 'boolean':
        returnValue = data ? true : false
        break
      case 'number':
        returnValue = data > 0 ? true : false
        break
    }
    return returnValue
  }

  /**
   * @description Function which evaluates the given conditions decides whether the content is eligible or not
   *
   * @param {NSContent.IContentMeta} content Content for which condition needs to be checked
   * @param {IAuthConditions} [conditions] Condition which needs to be evaluated against includes both fit and not not fit
   * @returns {boolean}  True if passed the evaluation
   * @memberof EditorContentService
   */
  checkConditionV2(content: NSContent.IContentMeta, conditions?: IConditionsV2, title?: string): boolean {
    if (conditions) {
      let returnValue = true
      if (conditions.notFit && conditions.notFit.length) {
        returnValue = !this.checkUniqueCondition(content, conditions.notFit as any, title)
      }
      if (returnValue && conditions.fit && conditions.fit.length) {
        returnValue = this.checkUniqueCondition(content, conditions.fit as any, title)
      }
      return returnValue
    }
    return true
  }

  /**
   * @description Invisible function which actually does the work
   *
   * @param {NSContent.IContentMeta} content Content for which condition needs to be checked
   * @param {{ [key in keyof NSContent.IContentMeta]: string[] }[]} conditions Condition which needs to be evaluated against
   * @returns {boolean} True if passed the evaluation
   * @memberof EditorContentService
   */
  checkUniqueCondition(
    content: NSContent.IContentMeta,
    conditions: { [key in keyof NSContent.IContentMeta]: any[] }[],
    title?: string
  ): boolean {
    try {
      return conditions.some(condition => {
        let isLocalPassed = true
        Object.keys(condition).forEach(meta => {
          if (
            condition[meta as keyof NSContent.IContentMeta].indexOf(
              content[meta as keyof NSContent.IContentMeta],
            ) < 0
          ) {
            isLocalPassed = false
          }

          if (title === 'Review') {
            if (content['reviewStatus' as keyof NSContent.IContentMeta] === 'InReview') {
              isLocalPassed = true
            } else {
              isLocalPassed = false
            }
          } else if (title === 'Publish'
            && content[meta as keyof NSContent.IContentMeta] === 'Review'
            && content['reviewStatus' as keyof NSContent.IContentMeta] === 'Reviewed'
          ) {
            isLocalPassed = true
          }

        })
        return isLocalPassed
      })
    } catch (ex) {
      // tslint:disable-next-line: no-console
      // console.log(ex)
      return false
    }
  }

  jsonVerify(s: string) { try { JSON.parse(s); return true } catch (e) { return false } }

}
