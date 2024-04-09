import * as vscode from "vscode";
import { commands } from "vscode";
import { newProvider } from "./commands";

const DART_MODE = { language: "dart", scheme: "file" };

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand("riverpodgen-freezed.new-provider", newProvider)
  );
}

export function deactivate() {}
