// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	function makefiles(filepaths) {
        filepaths.forEach(filepath => makeFileSync(filepath));
    }

	function makeDirSync(dir) {
        if (fs.existsSync(dir)) return;
        if (!fs.existsSync(path.dirname(dir))) {
            makeDirSync(path.dirname(dir));
        }
        fs.mkdirSync(dir);
    }

	function makeFileSync(filename) {
        if (!fs.existsSync(filename)) {
            makeDirSync(path.dirname(filename));
            fs.createWriteStream(filename).close();
        }
    }

	function generateComponentFilenames (relativePath, componentName) {
		return [
			`${componentName}.tsx`,
			`${componentName}.styles.scss`,
			`${componentName}.types.ts`,
			`${componentName}.constants.ts`,
			`${componentName}.tableConfig.ts`,
			`${componentName}.rjsf.ts`,
			'index.ts',
		].map((filename) => path.join(relativePath, componentName, filename));
	}

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "rio-component-creator" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json

	let createComponentDisposable = vscode.commands.registerCommand('rio-component-creator.create-component', function (uri) {
		try {
			// The code you place here will be executed every time your command is executed
			const workspaceUri = vscode.workspace.getWorkspaceFolder(uri).uri;

			let absolutePath = uri || vscode.workspace.workspaceFolders[0].uri.fsPath;
			absolutePath = vscode.Uri.parse(absolutePath.toString()).path;

			const workspacePath = vscode.Uri.parse(workspaceUri.toString()).path;
			const relativePath = absolutePath.replace(workspacePath, '');

			vscode.window.showInputBox({
				value: '',
				prompt: `Create New Component at ${relativePath}`,
				ignoreFocusOut: true,
				valueSelection: [-1, -1]
			}).then((componentName) => {
				const componentDirectoryPath = path.join(absolutePath, componentName);
				makeDirSync(componentDirectoryPath);
				makefiles(generateComponentFilenames(absolutePath, componentName))
			}).catch(e => {
				console.error({ e });
				vscode.window.showErrorMessage(e.code, e.message);
			});

		} catch (e) {
			console.log({ e });
		}
	});
	context.subscriptions.push(createComponentDisposable);

}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
