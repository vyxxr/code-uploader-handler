import * as vscode from "vscode";
import { ExtensionContext, window, commands, StatusBarAlignment, env } from "vscode";
import axios from 'axios';
import * as FormData from 'form-data';

export function activate(context: ExtensionContext) {
	const commandId = "code-uploader-handler.sprunge";

	let disposable = commands.registerCommand(commandId, async () => {
		const editor = window.activeTextEditor;

		const selection = editor?.selection;

		const selected =
			editor?.document.getText(selection) || editor?.document.getText();

		if (!selected) {
			window.showErrorMessage("Cannot create Empty Bin.");
			return;
		}

		const sourceUrl = 'http://sprunge.us';

		const formData = new FormData();
		formData.append('sprunge', selected);

		const { data: url } = await axios.post(sourceUrl, formData, {
			headers: formData.getHeaders()
		})

		// vscode.window.showInformationMessage('Hello World from Code Uploader Handler!');
		const openURL = "Open URL";
		const copyURL = "Copy URL";
		const message = `Successfully uploaded to Sourcebin. Link: ${url}`;

		window.showInformationMessage(message, ...[openURL, copyURL]).then(selection => {
			if (selection === openURL) {
				vscode.env.openExternal(url);
			}
			else if (selection === copyURL) {
				try {
					env.clipboard.writeText(url)
					window.showInformationMessage(`Successfully copied the URL to your clipboard.`);
				} catch (e) {
					window.showErrorMessage(`Failed to copy the url. ${e}`);
				}
			}
		});
	});

	// create status bar button as a shortcut
	const statusBarItem = window.createStatusBarItem(
		StatusBarAlignment.Right,
		1000
	);
	statusBarItem.command = commandId;
	statusBarItem.text = "Upload to Bin";
	statusBarItem.tooltip = "Upload selection/file to SourceBin";
	statusBarItem.show();

	context.subscriptions.push(disposable);
	context.subscriptions.push(statusBarItem);
}