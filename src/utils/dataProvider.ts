const api = 'http://localhost:8080'

export function authFetch(url: string | URL | Request, options?: RequestInit) {
	return fetch(url, {
		...options,
		headers: {
			Authorization: `Bearer ${localStorage.getItem('authToken')}`,
			'content-type': 'application/json',
			...options?.headers
		}
	})
}

export type Result<T> = {
	status: {
		error: boolean
		code: string
	}
	message: string
	result: T
	count?: number
}

type baseQueryFilters = string | number | boolean | (string | number | boolean)[]

export type filter<T, K extends object> =
	T extends object ?
		{
			like?: Partial<Record<keyof T, string>>
		} & Partial<Record<keyof T | keyof K, baseQueryFilters>>
	:	{
			like?: Record<string, string>
		} & Record<string, baseQueryFilters>

export type listFilter<T extends object, K extends object> = (
	| {
			like?: Partial<Record<keyof T, string>>
			orderBy?: keyof T
			order?: 'ASC' | 'DESC'
			nonPaginated: true
			toCreatedDate?: string
			fromCreatedDate?: string
	  }
	| {
			like?: Partial<Record<keyof T, string>>
			orderBy?: keyof T
			order?: 'ASC' | 'DESC'
			count?: number
			page?: number
			nonPaginated?: false | undefined
			toCreatedDate?: string
			fromCreatedDate?: string
	  }
) &
	Partial<Record<keyof T | keyof K, baseQueryFilters>>

export const dataProvider = {
	create: async <TEntity extends object, TResult = string | number>(
		resource: string,
		body: TEntity,
		queryParams?: Record<string, baseQueryFilters>
	) => {
		let queryString: string | undefined
		if (queryParams) {
			const params = new URLSearchParams()
			Object.keys(queryParams).forEach((e) => {
				if (Array.isArray(queryParams[e])) {
					/* eslint-disable-next-line @typescript-eslint/no-explicit-any*/
					;(queryParams[e] as any[]).forEach((ee) => params.append(e, ee))
				} else {
					/* eslint-disable-next-line @typescript-eslint/no-explicit-any*/
					params.append(e, queryParams[e] as any)
				}
			})
			queryString = params.toString()
		}
		return authFetch(
			`${api}/${resource}${
				queryString ?
					resource.includes('?') ?
						`&${queryString}`
					:	`?${queryString}`
				:	''
			}`,
			{
				method: 'POST',
				body: JSON.stringify(body)
			}
		)
			.then((res) => res.json())
			.then((data) => data as Result<TResult>)
			.catch((e) => {
				console.error(e)
				throw e
			})
	},

	post: async <TResult>(
		resource: string,
		/* eslint-disable-next-line @typescript-eslint/no-explicit-any*/
		body?: Record<any, any>,
		queryParams?: Record<string, baseQueryFilters>
	) => {
		let queryString: string | undefined
		if (queryParams) {
			const params = new URLSearchParams()
			Object.keys(queryParams).forEach((e) => {
				if (Array.isArray(queryParams[e])) {
					/* eslint-disable-next-line @typescript-eslint/no-explicit-any*/
					;(queryParams[e] as any[]).forEach((ee) => params.append(e, ee))
				} else {
					/* eslint-disable-next-line @typescript-eslint/no-explicit-any*/
					params.append(e, queryParams[e] as any)
				}
			})
			queryString = params.toString()
		}
		return authFetch(
			`${api}/${resource}${
				queryString ?
					resource.includes('?') ?
						`&${queryString}`
					:	`?${queryString}`
				:	''
			}`,
			{
				method: 'POST',
				body: JSON.stringify(body)
			}
		)
			.then((res) => res.json())
			.then((data) => data as Result<TResult>)
			.catch((e) => {
				console.error(e)
				throw e
			})
	},
	get: async <K extends object, TResult = Result<K>>(
		resource: string,
		identifier?: string,
		queryParams?: filter<TResult, K>
	) => {
		let queryString: string | undefined
		if (queryParams) {
			const params = new URLSearchParams()
			if (queryParams.like) {
				Object.keys(queryParams.like).forEach((e) => {
					if (queryParams.like![e as string | keyof TResult]?.includes('%')) {
						params.append(`like[${e}]`, queryParams.like![e as string | keyof TResult] || '')
					} else {
						params.append(
							`like[${e}]`,
							`%${(queryParams.like as any)![e as string | keyof TResult] ?? ''}%`
						)
					}
				})
				delete queryParams.like
			}
			Object.keys(queryParams).forEach((e) => {
				if (Array.isArray(queryParams[e as keyof filter<TResult, K>])) {
					/* eslint-disable-next-line @typescript-eslint/no-explicit-any*/
					;(queryParams[e as keyof filter<TResult, K>] as any[]).forEach((ee) =>
						params.append(e, ee)
					)
				} else {
					/* eslint-disable-next-line @typescript-eslint/no-explicit-any*/
					params.append(e, queryParams[e as keyof filter<TResult, K>] as any)
				}
			})
			queryString = params.toString()
		}
		let url = `${api}/${resource}`
		if (identifier) url += `/${identifier}`
		return authFetch(
			`${url}${
				queryString ?
					url.includes('?') ?
						`&${queryString}`
					:	`?${queryString}`
				:	''
			}`
		)
			.then((res) => res.json())
			.then((data) => data as TResult)
			.catch((e) => {
				console.error(e)
				throw e
			})
	},
	getList: async <K extends object, TResult extends object = K>(
		resource: string,
		queryParams?: listFilter<TResult, K>
	) => {
		let queryString: string | undefined
		if (queryParams) {
			const params = new URLSearchParams()
			if (queryParams.like) {
				Object.keys(queryParams.like).forEach((e) => {
					if (queryParams.like![e as keyof TResult]?.includes('%')) {
						params.append(`like[${e}]`, queryParams.like![e as keyof TResult] || '')
					} else {
						params.append(`like[${e}]`, `%${queryParams.like![e as keyof TResult & string]}%`)
					}
				})
				delete queryParams.like
			}
			Object.keys(queryParams).forEach((e) => {
				if (Array.isArray(queryParams[e as keyof listFilter<TResult, K>])) {
					/* eslint-disable-next-line @typescript-eslint/no-explicit-any*/
					;(queryParams[e as keyof listFilter<TResult, K>] as any[]).forEach((ee) =>
						params.append(e, ee)
					)
				} else {
					params.append(
						e,
						/* eslint-disable-next-line @typescript-eslint/no-explicit-any*/
						queryParams[e as keyof listFilter<TResult, K>] as any
					)
				}
			})
			queryString = params.toString()
		}
		return authFetch(
			`${api}/${resource}${
				queryString ?
					resource.includes('?') ?
						`&${queryString}`
					:	`?${queryString}`
				:	''
			}`
		)
			.then((res) => res.json())
			.then((data) => data as Result<TResult[]>)
			.catch((e) => {
				console.error(e)
				throw e
			})
	},
	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	update: async <TEntity extends object, TResult extends object = {}>(
		resource: string,
		identifier: string,
		body: Partial<TEntity>,
		queryParams?: Record<string, baseQueryFilters>
	) => {
		let queryString: string | undefined
		if (queryParams) {
			const params = new URLSearchParams()
			Object.keys(queryParams).forEach((e) => {
				if (Array.isArray(queryParams[e])) {
					/* eslint-disable-next-line @typescript-eslint/no-explicit-any*/
					;(queryParams[e] as any[]).forEach((ee) => params.append(e, ee))
				} else {
					/* eslint-disable-next-line @typescript-eslint/no-explicit-any*/
					params.append(e, queryParams[e] as any)
				}
			})
			queryString = params.toString()
		}
		const postApi = `${resource}/${identifier}`
		return authFetch(
			`${api}/${postApi}${
				queryString ?
					postApi.includes('?') ?
						`&${queryString}`
					:	`?${queryString}`
				:	''
			}`,
			{
				method: 'PUT',
				body: JSON.stringify(body)
			}
		)
			.then((res) => res.json())
			.then((data) => data as Result<TResult>)
			.catch((e) => {
				console.error(e)
				throw e
			})
	},
	delete: async <TResult>(
		resource: string,
		identifier: string,
		queryParams?: Record<string, baseQueryFilters>
	) => {
		let queryString: string | undefined
		if (queryParams) {
			const params = new URLSearchParams()
			Object.keys(queryParams).forEach((e) => {
				if (Array.isArray(queryParams[e])) {
					/* eslint-disable-next-line @typescript-eslint/no-explicit-any*/
					;(queryParams[e] as any[]).forEach((ee) => params.append(e, ee))
				} else {
					/* eslint-disable-next-line @typescript-eslint/no-explicit-any*/
					params.append(e, queryParams[e] as any)
				}
			})
			queryString = params.toString()
		}
		const postApi = `${resource}/${identifier}`
		return authFetch(
			`${api}/${postApi}${
				queryString ?
					postApi.includes('?') ?
						`&${queryString}`
					:	`?${queryString}`
				:	''
			}`,
			{
				method: 'DELETE'
			}
		)
			.then((res) => res.json())
			.then((data) => data as Result<TResult>)
			.catch((e) => {
				console.error(e)
				throw e
			})
	}
}
