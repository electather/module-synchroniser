import { Queue } from "./queue";

export function ModuleSynchronizer<T extends SynchronizerInput>(
  module: Promise<T>
): SynchronizerReturnType<T> {
  let loadedModule: T | undefined;
  const queue = new Queue<FunctionQueueType<T>>();

  module
    .then((module) => {
      loadedModule = module;
      queue.foreach((queue) => {
        const [propName, args, resolve] = queue;
        if (propName === "self") {
          return resolve((module as any)(...args));
        }
        resolve((module[propName as keyof T] as any)(...args));
      });
    })
    .catch((error) => {
      queue.foreach((queue) => {
        const [, , , reject] = queue;
        reject(error);
      });
    });

  return new Proxy(() => {}, {
    get(_target, prop) {
      return (...args: any[]) => {
        return new Promise((resolve, reject) => {
          if (loadedModule) {
            resolve((loadedModule[prop as keyof T] as any)(...args));
          } else {
            queue.enqueue([prop as any, args as any, resolve, reject]);
          }
        });
      };
    },
    apply(_target, thisArg, args) {
      if (loadedModule) {
        return (loadedModule as any).apply(thisArg, args);
      }

      return new Promise((resolve, reject) => {
        queue.enqueue(["self" as any, args as any, resolve, reject]);
      });
    },
  }) as SynchronizerReturnType<T>;
}

type FunctionQueueType<T extends SynchronizerInput> = [
  T extends GenericFunction ? "self" : keyof T,
  T extends GenericFunction ? Parameters<T> : any[],
  (value: T) => void,
  (reason: any) => void
];

type GenericFunction = (...args: any[]) => any;
type GenericModule = Record<string, GenericFunction>;
type SynchronizerInput = GenericFunction | GenericModule;

type SynchronizerReturnType<T> = T extends GenericFunction
  ? (...args: Parameters<T>) => Promise<ReturnType<T>>
  : T extends Record<string, GenericFunction>
  ? { [K in keyof T]: (...args: Parameters<T[K]>) => Promise<ReturnType<T[K]>> }
  : never;
