/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */

import { basename, extname } from "node:path";

import { trace } from "@opentelemetry/api";
import ErrorStackParser from "error-stack-parser";

import type { C4Name } from "./C4Model";
import {
  type C4ComponentParams,
  type C4ContainerParams,
  type C4SoftwareSystemParams,
} from "./C4ModelBuilder";
import { globalC4ModelBuilder } from "./globals";
type Constructor<T = object> = new (...args: any[]) => T;

type SoftwareSystem = Constructor;
type Container = Constructor;
type Component = Constructor;

export function C4SoftwareSystem<T extends SoftwareSystem>(
  params?: C4SoftwareSystemParams,
) {
  return (system: T) => {
    globalC4ModelBuilder.addSoftwareSystem(system.name as C4Name, {
      tags: params?.tags,
    });
    return system;
  };
}

export function C4Container<T extends Container>({
  softwareSystem,
  tags,
}: C4ContainerParams) {
  return (container: T) => {
    globalC4ModelBuilder.addContainer(container.name as C4Name, {
      softwareSystem,
      tags,
    });
    return container;
  };
}

export function C4Component<T extends Component>({
  container,
  tags,
}: C4ComponentParams) {
  return (component: T) => {
    globalC4ModelBuilder.addComponent(component.name as C4Name, {
      container,
      tags,
    });
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
    const calleeName = this.constructor.name as C4Name;

    const stack = ErrorStackParser.parse(new Error());
    const callerClassNameCandidates = stack
      .filter((frame) => !frame.fileName?.match(/\/node_modules\//))
      .filter((frame) => !frame.fileName?.match(/^node:internal/))
      .flatMap(toClassNames);

    const callerName = callerClassNameCandidates.find(
      (callerName) =>
        callerName !== calleeName && globalC4ModelBuilder.hasObject(callerName),
    );

    const operationName = method.name;
    if (callerName) {
      globalC4ModelBuilder.addCall(callerName, calleeName, operationName);
    }

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

function toClassNames(frame: ErrorStackParser.StackFrame): readonly C4Name[] {
  const classNames: C4Name[] = [];
  const functioNameParts = frame.functionName?.split(".") || [];
  if (functioNameParts.length === 2) {
    classNames.push(functioNameParts[0] as C4Name);
  }
  if (frame.fileName) {
    classNames.push(
      basename(frame.fileName, extname(frame.fileName)) as C4Name,
    );
  }
  return classNames;
}
