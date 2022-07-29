import "reflect-metadata";
const requiredMetadataKey = Symbol("required");

function required(target: Object, propertyKey: string | symbol, parameterIndex: number) {
  let existingRequiredParameters: number[] =
    Reflect.getOwnMetadata("require", target, propertyKey) || [];
  existingRequiredParameters.push(parameterIndex);
  Reflect.defineMetadata("require", existingRequiredParameters, target, propertyKey);
}

function validate(
  target: any,
  propertyName: string,
  descriptor: TypedPropertyDescriptor<any>
) {
  let method = descriptor.value!;

  descriptor.value = function () {
    let requiredParameters: number[] = Reflect.getOwnMetadata(
      "required",
      target,
      propertyName
    );
    if (requiredParameters) {
      for (let parameterIndex of requiredParameters) {
        if (
          parameterIndex >= arguments.length || //如果要求传入的参数下标比arguments小
          arguments[parameterIndex] === undefined //或者arguments的对应内容是undefined
        ) {
          throw new Error("Missing required argument.");
        }
      }
    }
    return method.apply(this, arguments); //否则就返回原来执行的值
  };
}
class BugReport {
  type = "report";
  title: string;

  constructor(t: string) {
    this.title = t;
  }

  @validate
  print(@required verbose: boolean) {
    if (verbose) {
      return `type: ${this.type}\ntitle: ${this.title}`;
    } else {
      return this.title;
    }
  }
}
