import 'reflect-metadata'
export type ValidatorFunction = (value: any) => boolean;
export interface ValidatorOptions {
  validatorFunction?: ValidatorFunction;
  required?: boolean;
  updatable?: boolean;
}

export function defaultValidator(value: any): boolean {
  return true;
}

export function Validator(options?: ValidatorOptions) {
  const validatorOptions = options?.validatorFunction ?? defaultValidator
  const required = options?.required ?? false
  const updatable = options?.updatable ?? true
  return function (target: Object, propertyKey: string | symbol) {
    Reflect.defineMetadata(`smoke:${propertyKey.toString()}:validator`, validatorOptions, target)
    Reflect.defineMetadata(`smoke:${propertyKey.toString()}:required`, required, target)
    Reflect.defineMetadata(`smoke:${propertyKey.toString()}:updatable`, updatable, target)
  }
}