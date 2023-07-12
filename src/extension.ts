import * as vscode from "vscode";
import { ExtensionContext, window, commands, StatusBarAlignment, env, Uri } from "vscode";
import axios from 'axios';
import * as FormData from 'form-data';

export function activate(context: ExtensionContext) {
	const commandId = "code-uploader-handler.upload";

	const options = ['sprunge', 'iotek']

	let disposable = commands.registerCommand(commandId, async () => {

		const value = await window.showQuickPick(options, { placeHolder: 'Select the website to upload your code.' });

		if (value) {
			const editor = window.activeTextEditor;

			const selection = editor?.selection;

			const selected =
				editor?.document.getText(selection) || editor?.document.getText();

			if (!selected) {
				window.showErrorMessage("Cannot create Empty Bin.");
				return;
			}

			let url: Uri | undefined

			switch (value) {
				case 'sprunge':
					url = await sprunge(selected)
					break;
				case 'iotek':
					url = await iotek(selected)
					break;
			}

			if (url) {
				const openURL = "Open URL";
				const copyURL = "Copy URL";
				const message = `Successfully uploaded to Sourcebin. Link: ${url}`;

				window.showInformationMessage(message, ...[openURL, copyURL]).then(selection => {
					if (selection === openURL) {
						vscode.env.openExternal(url!);
					}
					else if (selection === copyURL) {
						try {
							env.clipboard.writeText(url!.toString())
							window.showInformationMessage(`Successfully copied the URL to your clipboard.`);
						} catch (e) {
							window.showErrorMessage(`Failed to copy the url. ${e}`);
						}
					}
				});
			}
		}
	});

	// create status bar button as a shortcut
	const statusBarItem = window.createStatusBarItem(
		StatusBarAlignment.Right,
		1000
	);
	statusBarItem.command = commandId;
	statusBarItem.text = "Upload code";
	statusBarItem.tooltip = "Upload selected code";
	statusBarItem.show();

	context.subscriptions.push(disposable);
	context.subscriptions.push(statusBarItem);
}

async function sprunge(code: string) {
	const sourceUrl = 'http://sprunge.us';

	const formData = new FormData();
	formData.append('sprunge', code);

	const { data: url } = await axios.post(sourceUrl, formData, {
		headers: formData.getHeaders()
	})

	return url
}

async function iotek(code: string) {
	const sourceUrl = 'https://p.iotek.org';

	const { data: url } = await axios.put(sourceUrl, {
		data: code
	})

	return url
} 
