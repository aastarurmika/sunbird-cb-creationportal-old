import { Injectable } from '@angular/core'
import { ICollectionEditorConfig } from './../interface/collection-editor'
import { ICreateEntity } from './../interface/create-entity'
import { IFormMeta } from './../interface/form'
import { IConditionsV2 } from '../interface/conditions-v2'
import { IMetaUnit } from '../routing/modules/editor/interface/meta'
import { Subject } from 'rxjs'

interface IPermission {
  conditions: IConditionsV2
  enabledByDefault: boolean
}
/**
 * @export
 * @class AuthInitService
 *
 * Service acts as a store through which we can save data on
 * the first time load and access it on further request so no need
 * to call the api call again and again
 */
@Injectable()
export class AuthInitService {
  private messageSource = new Subject<any>()
  public currentMessage = this.messageSource.asObservable()
  private publishSource = new Subject<any>()
  public publishMessage = this.publishSource.asObservable()
  private uploadSource = new Subject<any>()
  public uploadMessage = this.uploadSource.asObservable()
  private editCourseContent = new Subject<any>()
  public editCourseMessage = this.editCourseContent.asObservable()

  authConfig!: IFormMeta
  authMetaV2!: { [key: string]: IMetaUnit<any> }
  ordinals: any
  authAdditionalConfig!: any
  collectionConfig!: ICollectionEditorConfig
  creationEntity = new Map<string, ICreateEntity>()
  optimizedWorkFlow!: { allow: boolean; conditions: IConditionsV2 }
  workFlowTable!: { conditions: IConditionsV2; workFlow: string[] }[]
  ownerDetails!: {
    status: string[]
    owner: string
    name: string
    relatedActions: string[]
    actionName: string
  }[]
  permissionDetails!: { role: string; editContent: IPermission; editMeta: IPermission }[]

  changeMessage(message: string) {
    this.messageSource.next(message)
  }
  publishData(message: any) {
    this.publishSource.next(message)
  }
  uploadData(message: any) {
    this.uploadSource.next(message)
  }
  editCourse(message: any) {
    this.editCourseContent.next(message)
  }
}
