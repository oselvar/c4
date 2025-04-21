/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */

import { basename, extname } from "node:path";

import { trace } from "@opentelemetry/api";
import ErrorStackParser from "error-stack-parser";

type Constructor<T = object> = new (...args: any[]) => T;

type Component = Constructor;

type C4ComponentParams = {
  tags?: string[];
};
export function C4Component<T extends Component>(params?: C4ComponentParams) {
  return (component: T) => {
    const tracer = trace.getTracer("@oselvar/c4");
    const span = tracer.startSpan("component");
    span.setAttribute("name", component.name);
    span.setAttribute("tags", params?.tags || []);
    span.end();
    return component;
  };
}

export function C4Operation(): MethodDecorator {
  return function (...args: any[]): any {
    if (
      args.length === 2 &&
      args[1] &&
      typeof args[1] === "object" &&
      args[1].kind === "method"
    ) {
      // TC39 decorator
      const method = args[0];
      return c4OperationWrapper(method);
    } else {
      // Legacy experimental decorator
      const descriptor = args[2];
      if (descriptor && typeof descriptor.value === "function") {
        const originalMethod = descriptor.value;
        descriptor.value = c4OperationWrapper(originalMethod);
      }
      return descriptor;
    }
  };
}

function c4OperationWrapper(method: Function) {
  async function wrapper(this: Function, ...args: unknown[]) {
    const calleeName = this.constructor.name;

    const stack = ErrorStackParser.parse(new Error());
    const callerClassNameCandidates = stack
      .filter((frame) => !frame.fileName?.match(/\/node_modules\//))
      .filter((frame) => !frame.fileName?.match(/^node:internal/))
      .flatMap(toClassNames);

    const callerName = callerClassNameCandidates.find(
      (callerName) => callerName !== calleeName,
    );

    const operationName = method.name;
    // TODO: Move this to the model builder so all otel logic it in one place
    const tracer = trace.getTracer("@oselvar/c4");
    return tracer.startActiveSpan(
      "call",
      {
        attributes: {
          callerName,
          calleeName,
          operationName,
        },
      },
      async (span) => {
        try {
          return await method.apply(this, args);
        } finally {
          span.end();
        }
      },
    );
  }
  return wrapper;
}

function toClassNames(frame: ErrorStackParser.StackFrame): readonly string[] {
  const classNames: string[] = [];
  const functioNameParts = frame.functionName?.split(".") || [];
  if (functioNameParts.length === 2) {
    classNames.push(functioNameParts[0]);
  }
  if (frame.fileName) {
    classNames.push(basename(frame.fileName, extname(frame.fileName)));
  }
  return classNames;
}
