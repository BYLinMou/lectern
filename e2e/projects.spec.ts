import { expect, makeLecture, seedLectures, test } from "./fixtures";

test("classifies legacy recordings into projects and back to Ungrouped across reloads", async ({
  page,
}) => {
  await seedLectures(page, [makeLecture(), makeLecture({ id: "second", title: "Paging" })]);
  await page.goto("/");
  const ungrouped = page.getByRole("list", { name: "Ungrouped recordings" });
  await expect(ungrouped.getByRole("listitem")).toHaveCount(2);
  await page.getByRole("button", { name: /^Operating Systems 101/ }).click();

  page.once("dialog", (dialog) => dialog.accept("Systems"));
  await page.getByLabel("Move Operating Systems 101 to project").selectOption("new");
  const project = page.getByRole("list", { name: "Systems recordings" });
  await expect(project.getByRole("button", { name: /^Operating Systems 101/ })).toBeVisible();
  await page.getByLabel("Move Paging to project").selectOption("project:Systems");
  await expect(project.getByRole("listitem")).toHaveCount(2);

  await page.reload();
  await expect(project.getByRole("listitem")).toHaveCount(2);
  await page
    .getByRole("group", { name: "Project Systems", exact: true })
    .locator("summary")
    .click();
  await expect(project).not.toBeVisible();
  await page
    .getByRole("group", { name: "Project Systems", exact: true })
    .locator("summary")
    .click();

  // Cancelling folder creation keeps the recording in its existing project.
  page.once("dialog", (dialog) => dialog.dismiss());
  await page.getByLabel("Move Paging to project").selectOption("new");
  await expect(page.getByLabel("Move Paging to project")).toHaveValue("project:Systems");
  await page.getByLabel("Move Operating Systems 101 to project").selectOption("");
  await expect(ungrouped.getByRole("button", { name: /^Operating Systems 101/ })).toBeVisible();
  await page.reload();
  await expect(ungrouped.getByRole("listitem")).toHaveCount(1);
  await expect(project.getByRole("listitem")).toHaveCount(1);
});
