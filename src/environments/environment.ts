// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment: IEnvironment = {
  production: false,
  sitePath: 'cbp-sphere.aastrika.org',
  organisation: 'aastrika',
  framework: 'test_fw_1',
  channelId: '0131397178949058560',
  // karmYogi: 'https://igot-sunbird.idc.tarento.com/',
  karmYogi: 'https://cbp-sphere.aastrika.org/',
  azureHost: 'https://sunbirdcontent.s3-ap-south-1.amazonaws.com',
  azureBucket: 'content',
  azureOldHost: 'https://staas-bbs1.cloud.gov.in',
  azureOldBuket: 'igot',
  cbpPortal: 'https://cbp-sphere.aastrika.org/',
  scromContentEndpoint: 'assets/public/content/html/',
}
interface IEnvironment {
  production: boolean
  sitePath: null | string
  organisation: string
  framework: string
  channelId: string
  karmYogi: string,
  azureHost: string
  azureBucket: string
  azureOldHost: string
  azureOldBuket: string
  cbpPortal: string
  scromContentEndpoint: string
  // portalRoles: string[]
}

/*
 * For easier debugging in development mode, you can import the    file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
import 'zone.js/dist/zone-error' // Included with Angular CLI.x
