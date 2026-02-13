const normalizeResponse = (value: unknown): string => {
    return JSON.stringify(sortRecursively(value))
}

const sortRecursively = (value: any): any => {
    if (Array.isArray(value)) return value.map(sortRecursively)

    if (value && typeof value === "object" && value.constructor === Object) {
    return Object.keys(value)
      .sort()
      .reduce((acc: any, key) => {
        acc[key] = sortRecursively(value[key]);
        return acc;
      }, {});
  }

  return value;
}

export {normalizeResponse}