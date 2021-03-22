// eslint-disable-next-line no-shadow
enum ValueKey {
  INTEGER = 'integerValue',
  STRING = 'stringValue',
  TIMESTAMP = 'timestampValue',
  ARRAY = 'arrayValue',
  MAP = 'mapValue',
}

type StringSourceType = { [ValueKey.STRING]: string }
type IntegerSourceType = { [ValueKey.INTEGER]: string }
type TimestampSourceType = { [ValueKey.TIMESTAMP]: string }
// eslint-disable-next-line no-use-before-define
type ArraySourceType = { [ValueKey.ARRAY]: { values: SourceType[] } }
// eslint-disable-next-line no-use-before-define
type MapSourceType = { [ValueKey.MAP]: { fields: SourceType } }

type SourceType = StringSourceType
  | IntegerSourceType
  | TimestampSourceType
  | ArraySourceType
  | MapSourceType

// eslint-disable-next-line no-use-before-define
type ResultType = string | number | Date | ResultType[] | MapResultType
type MapResultType = { [key: string]: ResultType }

export function loadValue(field: any): ResultType {
  if (ValueKey.INTEGER in field) {
    return parseInt(field[ValueKey.INTEGER], 10);
  }
  if (ValueKey.STRING in field) {
    return field[ValueKey.STRING];
  }
  if (ValueKey.TIMESTAMP in field) {
    return new Date(field[ValueKey.TIMESTAMP]);
  }
  if (ValueKey.ARRAY in field) {
    return field.arrayValue.values
      .filter((item: SourceType) => !!item)
      .map((item: SourceType) => loadValue(item));
  }
  if (ValueKey.MAP in field) {
    // eslint-disable-next-line no-use-before-define
    return loadMap(field[ValueKey.MAP]);
  }
  return 'unknown';
}

export function loadMap({fields}: { fields: any }): MapResultType {
  return Object.keys(fields)
    .reduce((acc, name) => {
      // eslint-disable-next-line
      acc[name] = loadValue(fields[name]);
      return acc;
    }, {} as MapResultType);
}
