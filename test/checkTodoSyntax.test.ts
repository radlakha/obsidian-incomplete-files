import { describe, test, expect, vi } from "vitest";
import { checkTodoSyntax } from "@/rules/checkTodoSyntax";
import type { TFile } from "obsidian";
import { getDataFromTextSync } from "@/util/getDataFromFile";

vi.mock("obsidian");

describe("checkTodoSyntax", () => {
	// @ts-ignore
	const mockFile: TFile = {
		path: "test.md",
		name: "test.md",
		stat: {
			ctime: 0,
			mtime: 0,
			size: 0,
		},
		basename: "test",
		extension: "md",
	};

	test("should return empty array for a file with no content", () => {
		const markdown = "";
		const data = getDataFromTextSync(markdown);
		const result = checkTodoSyntax.func(mockFile, data);
		expect(result).toEqual([]);
	});

	test("should identify incomplete syntax without heading", () => {
		const markdown =
			"this is some content\n%% TODO(Summarize the thought) %% ";
		const data = getDataFromTextSync(markdown);
		const result = checkTodoSyntax.func(mockFile, data);
		expect(result.length).toBe(1);
		expect(result[0]?.title).toBe(
			"Summarize the thought"
		);
	});


test("should identify multiple todo syntax and corresponding headings", () => {
    const markdown = `
# Heading 1
Content here.
%%   TODO(Do something here) %%
## Heading 2
Content here.
%%   TODO(Write an explanation) %%
### Heading 3
Content here.
%%   TODO(Check this in) %%
`;
    const data = getDataFromTextSync(markdown);
    const result = checkTodoSyntax.func(mockFile, data);
    expect(result.length).toBe(3);
    expect(result[0]?.title).toMatch(/Do something here/);
    expect(result[0]?.heading).toBeDefined();
    expect(result[1]?.title).toMatch(/Write an explanation/);
    expect(result[1]?.heading).toBeDefined();
    expect(result[2]?.title).toMatch(/Check this in/);
});
});
