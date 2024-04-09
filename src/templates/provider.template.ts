import * as changeCase from "change-case";

export function getTemplate(providerName: string) {
  const pascalCaseName = changeCase.pascalCase(providerName);
  const snakeCaseName = changeCase.snakeCase(providerName);
  const providerState = `${pascalCaseName}State`;
  return `import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part '${snakeCaseName}.freezed.dart';
part '${snakeCaseName}.g.dart';
part '${snakeCaseName}_state.dart';

@riverpod
class ${pascalCaseName} extends _\$${pascalCaseName} {
  @override
  ${providerState} build() {
    return const ${pascalCaseName}Initial();
  }
}`;
}
