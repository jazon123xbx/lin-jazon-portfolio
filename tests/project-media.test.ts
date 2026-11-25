import test from "node:test";
import assert from "node:assert/strict";
// @ts-expect-error explicit .ts extension is required by the Node test runner
import { Project, type ProjectMedia } from "../src/domain/project.ts";

function project(media: readonly ProjectMedia[]) {
  return new Project({
    id: "media-test", title: "Media test", description: "Domain media tests",
    category: "Test", tags: ["Test"], status: "In Development", media,
  });
}

const image: ProjectMedia = { type: "image", src: "/test.png", alt: "Test image" };

test("legacy image and video records retain their three-key shape", () => {
  for (const type of ["image", "video"] as const) {
    const input = { ...image, type };
    const result = project([input]);
    assert.deepEqual(result.media, [input]);
    assert.deepEqual(result.toSnapshot().media, [input]);
    assert.deepEqual(Object.keys(result.media[0]), ["type", "src", "alt"]);
  }
});

test("empty media remains valid", () => {
  assert.equal(project([]).hasMedia, false);
  assert.deepEqual(project([]).toSnapshot().media, []);
});

test("explicit undefined metadata is omitted", () => {
  const result = project([{ ...image, label: undefined, width: undefined, height: undefined }]);
  assert.deepEqual(result.media[0], image);
  assert.deepEqual(Object.keys(result.toSnapshot().media[0]), ["type", "src", "alt"]);
});

test("labels trim independently and dimensions do not require a label", () => {
  assert.deepEqual(project([{ ...image, label: "  Dashboard  " }]).media[0], {
    ...image, label: "Dashboard",
  });
  assert.deepEqual(project([{ ...image, width: 572, height: 1144 }]).media[0], {
    ...image, width: 572, height: 1144,
  });
});

test("all metadata survives freezing, snapshots and JSON for both media types", () => {
  for (const type of ["image", "video"] as const) {
    const input = { ...image, type, label: "Preview", width: 572, height: 1144 };
    const result = project([input]);
    assert.equal(Object.isFrozen(result.media), true);
    assert.equal(Object.isFrozen(result.media[0]), true);
    assert.deepEqual(result.media[0], input);
    assert.deepEqual(result.toSnapshot().media[0], input);
    assert.deepEqual(JSON.parse(JSON.stringify(result.toSnapshot())).media[0], input);
  }
});

test("blank or non-string runtime labels are rejected", () => {
  for (const label of ["", " \t\n ", null, 0, false, {}, []]) {
    assert.throws(() => project([{ ...image, label } as unknown as ProjectMedia]), /project media label/);
  }
});

test("dimensions must be supplied together", () => {
  for (const fields of [{ width: 572 }, { height: 1144 }]) {
    assert.throws(() => project([{ ...image, ...fields }]), /width and height/);
  }
});

test("dimensions reject nonfinite, nonpositive, fractional and nonnumeric runtime values", () => {
  for (const invalid of [0, -1, -0, 0.5, NaN, Infinity, -Infinity, "572", null, true, {}, []]) {
    for (const field of ["width", "height"] as const) {
      assert.throws(() => project([{
        ...image, width: 572, height: 1144, [field]: invalid,
      } as unknown as ProjectMedia]), /width and height/);
    }
  }
});

test("positive integer dimensions have no new arbitrary maximum or ratio rule", () => {
  assert.equal(project([{ ...image, width: 1, height: Number.MAX_SAFE_INTEGER }]).media[0].width, 1);
});

test("existing media type, src and alt validation is preserved", () => {
  assert.throws(() => project([{ ...image, type: "audio" } as unknown as ProjectMedia]), /Unsupported project media type/);
  assert.throws(() => project([{ ...image, src: "  " }]), /project media src/);
  assert.throws(() => project([{ ...image, alt: "\t" }]), /project media alt/);
  assert.deepEqual(project([{ ...image, src: " /test.png ", alt: " Test image " }]).media[0], image);
});

test("constructor isolates array/items and discards unknown keys", () => {
  const input = { ...image, label: "Original", width: 572, height: 1144, provenance: "private" };
  const media = [input];
  const result = project(media);
  input.label = "Changed";
  input.width = 1;
  input.src = "/changed.png";
  media.push(input);
  assert.deepEqual(result.media, [{ ...image, label: "Original", width: 572, height: 1144 }]);
  assert.equal("provenance" in result.toSnapshot().media[0], false);
});

test("snapshots contain independent mutable array/items", () => {
  const result = project([{ ...image, label: "Original", width: 572, height: 1144 }]);
  const first = result.toSnapshot();
  const second = result.toSnapshot();
  assert.notEqual(first.media, second.media);
  assert.notEqual(first.media[0], second.media[0]);
  assert.equal(Object.isFrozen(first.media), false);
  assert.equal(Object.isFrozen(first.media[0]), false);
  first.media[0].label = "Changed";
  first.media[0].width = 1;
  first.media.push({ ...image });
  assert.equal(result.media.length, 1);
  assert.equal(result.media[0].label, "Original");
  assert.equal(second.media[0].width, 572);
});
