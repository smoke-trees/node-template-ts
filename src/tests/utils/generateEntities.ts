import { v4 } from 'uuid'
import { IResult } from '../../IResult'

export const referenceNo = '1'
export const partnerId = v4().toString()
export const partnerOrderId = v4().toString()
export const partnerUserId = v4().toString()
export const brandId = v4().toString()
export const orderId = v4().toString()


// export async function createDummyCompany(companyValues?: Partial<CompanyEntity>): Promise<([IResult<string| number>, CompanyEntity])> {
//   const company = new CompanyEntity({
//     name: companyValues?.name ? companyValues.name : 'name',
//     address: companyValues?.address ? companyValues.address : 'address',
//     city: companyValues?.city ? companyValues.city : 'city',
//     state: companyValues?.state ? companyValues.state : 'state',
//     zip: companyValues?.zip ? companyValues.zip : 'zip',
//     country: companyValues?.country ? companyValues.country : 'country',
//     phone: companyValues?.phone ? companyValues.phone : 'phone',
//     email: companyValues?.email ? companyValues.email : 'email',
//     website: companyValues?.website ? companyValues.website : 'website',
//     logo: companyValues?.logo ? companyValues.logo : 'logo'
//   })
//   const result = await company.create()
//   return [result, company]
// }
