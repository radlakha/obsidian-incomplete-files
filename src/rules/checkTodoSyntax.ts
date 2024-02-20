import { visit } from "unist-util-visit";
import type { Data } from "@/util/getDataFromFile";
import { TFile } from "obsidian";
import { INCOMPLETE_ISSUE_TYPE } from "./INCOMPLETE_ISSUE_TYPE";
import type { IssueScanner } from "@/rules/issueScanners";
import type { RawIssue } from "@/SettingsSchemas";
import type { Heading, Node, Text } from "mdast";
import { nodeToString } from "@/util/nodeToString";
/* import exp from "constants"; */

/**
 *	%% TODO(issue which is a string) %%
 *	%% TODO %%
 */

const syntaxRegex = /%%\s*TODO(?:\(([^)]+)\))?\s*%%/g;

export const checkTodoSyntax: IssueScanner = {
	icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-list-check"><path d="M5 12l5 5L19 6"/></svg>`,
	issueType: INCOMPLETE_ISSUE_TYPE.TODO_SYNTAX,
	setting: {
		name: "Todo syntax",
		description: "Check if the file has todo syntax",
		default: true,
	},
	func: (file: TFile, data: Data) => {
		if (data.body.trim() === "") {
			return [];
		}

		const issues: RawIssue[] = [];
		// @ts-ignore
		let currentHeading: Heading = null;

		visit(data.ast!, (node: Node) => {
			if (node.type === "heading") {
				currentHeading = node as Heading;
			} else if (node.type === "text") {
				const matches = (node as Text).value.matchAll(syntaxRegex);

				for (const match of matches) {
					const issue = match[1] ?? "TODO not described"; // Capture the todo issue
					const title = currentHeading ? `${issue}` : `${issue}`;

					issues.push({
						type: INCOMPLETE_ISSUE_TYPE.TODO_SYNTAX,
						title: title,
						heading: currentHeading
							? {
									depth: currentHeading.depth,
									// @ts-ignore
									text: nodeToString(currentHeading),
							  }
							: undefined,
					});
				}
			}
		});

		return issues;
	},
};
