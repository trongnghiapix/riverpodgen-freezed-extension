import * as changeCase from "change-case";

export function getStateTemplate(providerName: string): string {
  const pascalCaseName = changeCase.pascalCase(providerName);
  const snakeCaseName = changeCase.snakeCase(providerName);
  const camelCaseName = changeCase.camelCase(providerName);
  return `part of '${snakeCaseName}.dart';

@freezed
sealed class ${pascalCaseName}State with _\$${pascalCaseName}State {
  const ${pascalCaseName}State._();
  const factory ${pascalCaseName}State.${camelCaseName}Initial() = ${pascalCaseName}Initial;
}

extension ${pascalCaseName}StateX on ${pascalCaseName}State {
  bool get isInitial => this is ${pascalCaseName}Initial;
}
`;
}
