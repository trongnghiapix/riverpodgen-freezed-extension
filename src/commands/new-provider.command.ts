import * as _ from "lodash";
import * as changeCase from "change-case";
import { mkdirp } from "mkdirp";

import { InputBoxOptions, OpenDialogOptions, Uri, window, workspace } from "vscode";
import { existsSync, lstatSync, writeFile } from "fs";
import { getTemplate, getStateTemplate } from "../templates";

export const newProvider = async (uri: Uri) => {
  const providerName = await promptForProviderName();
  if (_.isNil(providerName) || providerName?.trim() === "") {
    window.showErrorMessage("The provider name must not be empty");
    return;
  }

  let targetDirectory;
  if (_.isNil(_.get(uri, "fsPath")) || !lstatSync(uri.fsPath).isDirectory()) {
    targetDirectory = await promptForTargetDirectory();
    if (_.isNil(targetDirectory)) {
      window.showErrorMessage("Please select a valid directory");
      return;
    }
  } else {
    targetDirectory = uri.fsPath;
  }

  const pascalCaseName = changeCase.pascalCase(providerName!);
  try {
    await generateProviderCode(providerName!, targetDirectory!);
    window.showInformationMessage(`Successfully Generated ${pascalCaseName} Provider`);
  } catch (error) {
    window.showErrorMessage(
      `Error:
        ${error instanceof Error ? error.message : JSON.stringify(error)}`
    );
  }
};

function promptForProviderName(): Thenable<string | undefined> {
  const providerNamePromptOptions: InputBoxOptions = {
    prompt: "Provider Name",
    placeHolder: "example: counter, user, authentication, etc...",
  };
  return window.showInputBox(providerNamePromptOptions);
}

async function promptForTargetDirectory(): Promise<string | undefined> {
  const options: OpenDialogOptions = {
    canSelectMany: false,
    openLabel: "Select a folder to create the provider in",
    canSelectFolders: true,
  };

  return window.showOpenDialog(options).then((uri) => {
    if (_.isNil(uri) || _.isEmpty(uri)) {
      return undefined;
    }
    return uri[0].fsPath;
  });
}

async function generateProviderCode(providerName: string, targetDirectory: string) {
  const providerDirectoryPath = `${targetDirectory}`;
  if (!existsSync(providerDirectoryPath)) {
    await createDirectory(providerDirectoryPath);
  }

  await Promise.all([
    createProviderStateTemplate(providerName, providerDirectoryPath),
    createProviderTemplate(providerName, providerDirectoryPath),
  ]);
}

function createDirectory(targetDirectory: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    mkdirp(targetDirectory)
      .then(() => {
        resolve();
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function createProviderStateTemplate(providerName: string, targetDirectory: string) {
  const snakeCaseName = changeCase.snakeCase(providerName);
  const targetPath = `${targetDirectory}/${snakeCaseName}_state.dart`;
  if (existsSync(targetPath)) {
    throw Error(`${snakeCaseName}_state.dart already exists`);
  }
  return new Promise<void>(async (resolve, reject) => {
    writeFile(targetPath, getStateTemplate(providerName), "utf8", (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

function createProviderTemplate(providerName: string, targetDirectory: string) {
  const snakeCaseName = changeCase.snakeCase(providerName);
  const targetPath = `${targetDirectory}/${snakeCaseName}.dart`;
  if (existsSync(targetPath)) {
    throw Error(`${snakeCaseName}.dart already exists`);
  }
  return new Promise<void>(async (resolve, reject) => {
    writeFile(targetPath, getTemplate(providerName), "utf8", (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}
