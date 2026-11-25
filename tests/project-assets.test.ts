import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
// @ts-expect-error explicit .ts extension is required by the Node test runner
import { projects, featuredProjects, featuredProjectLinks } from "../src/data/portfolio.ts";

const approvedRoot = "/images/projects/approved-assets-20261124/";
const tcgcRows = [
  ["01-dashboard.png", "Dashboard", "Home workspace showing upcoming classes, calendar, notes and alerts"],
  ["02-calendar.png", "Calendar", "Monthly class and special-date calendar with selected day schedule"],
  ["03-class-schedule.png", "Class schedule", "Weekly class schedule listing subjects, rooms, days and times"],
  ["04-notes.png", "Notes", "Notes list with categories, search and attachment controls"],
  ["05-study-tools.png", "Study tools", "Calculator, fraction calculator, and number system converter tools"],
  ["06-special-dates.png", "Special dates", "Saved dates, event cards and add-date action"],
  ["07-appearance-settings.png", "Appearance", "Theme modes and selectable color accents"],
  ["08-splash-screen.png", "Splash screen", "TCGC Student Master app splash screen"],
] as const;

const blazingRows = [
  ["01-main-menu-concept.png", "Main menu concept", "Illustrated BlazingHeart main-menu concept, not a verified running-game screenshot", 1280, 720],
  ["02-dragon-boss-scene-concept.png", "Dragon boss concept", "Illustrated BlazingHeart dragon boss-scene concept, not verified gameplay", 1280, 720],
  ["03-fireball-scene-view.png", "Fireball — Scene view", "Unity Scene view showing BlazingHeart projectile development with editor gizmos visible", 746, 308],
  ["04-game-over-game-view.png", "Game over — Game view", "Unity Game view showing the BlazingHeart game-over screen", 785, 334],
  ["05-castle-development.png", "Castle development", "BlazingHeart development capture showing a castle scene and character sprites", 1103, 469],
  ["06-grassland-level-layout.png", "Grassland — Scene view", "Unity Scene view showing a BlazingHeart grassland level layout during development", 747, 313],
  ["07-floating-platforms.png", "Floating platforms — Scene view", "Unity Scene view showing BlazingHeart floating-platform placement during development", 747, 313],
  ["08-platform-bridge.png", "Platform bridge — Scene view", "Unity Scene view showing a BlazingHeart platform-bridge layout during development", 747, 313],
  ["09-extended-bridge.png", "Extended bridge — Scene view", "Unity Scene view showing a BlazingHeart extended-bridge layout during development", 747, 313],
  ["10-lava-hazard-layout.png", "Lava hazards — Scene view", "Unity Scene view showing a BlazingHeart lava-hazard layout during development", 747, 313],
] as const;

const tcgc = tcgcRows.map(([file, label, alt]) => ({
  type: "image", src: `${approvedRoot}tcgc-student-master/gallery-clean/${file}`,
  label, alt, width: 572, height: 1144,
}));
const blazing = blazingRows.map(([file, label, alt, width, height]) => ({
  type: "image", src: `${approvedRoot}blazingheart/gallery-clean/${file}`,
  label, alt, width, height,
}));

test("all non-media project records, links and featured order remain unchanged", () => {
  const nonMedia = projects.map((project) => {
    const snapshot = project.toSnapshot();
    return {
      id: snapshot.id, title: snapshot.title, description: snapshot.description,
      category: snapshot.category, tags: snapshot.tags, status: snapshot.status,
      detailsUrl: snapshot.detailsUrl, sourceUrl: snapshot.sourceUrl,
    };
  });
  const expected = [
    {
      id: "tcgc-student-master", title: "TCGC Student Master",
      description: "A student productivity and academic management application built for tracking coursework, schedules, and institutional workflows.",
      category: "Mobile Application", tags: ["Flutter", "Dart"], status: "In Development",
    },
    {
      id: "jazon-collective-market", title: "Jazon Collective Market",
      description: "A digital marketplace platform designed for creative collectives to showcase and sell their work.",
      category: "Web Application", tags: ["Next.js", "TypeScript", "Tailwind CSS"], status: "In Development",
    },
    {
      id: "blazingheart", title: "BlazingHeart", description: "A 2D platformer game built with Unity and C#.",
      category: "Game Development", tags: ["Unity", "C#"], status: "In Development",
    },
    {
      id: "jay-the-barber", title: "Jay the Barber",
      description: "A modern booking and portfolio website for a barbershop, featuring appointment scheduling and service showcases.",
      category: "Web Application", tags: ["React", "CSS", "JavaScript"], status: "Completed",
    },
    {
      id: "academic-projects", title: "Academic Projects",
      description: "A collection of coursework and academic projects demonstrating foundational development skills.",
      category: "Academic", tags: ["HTML", "CSS", "JavaScript", "Python"], status: "Case Study",
    },
  ].map((project) => ({ ...project, detailsUrl: undefined, sourceUrl: undefined }));
  assert.deepEqual(nonMedia, expected);
  assert.deepEqual(featuredProjects.map((project) => project.id), [
    "tcgc-student-master", "jazon-collective-market", "blazingheart",
  ]);
  assert.deepEqual(featuredProjectLinks, expected.slice(0, 3).map(({ id, title }) => ({ id, title, href: `/#${id}` })));
});

test("gallery paths are unique approved PNGs, never covers or source material", () => {
  const media = projects.flatMap((project) => project.media);
  assert.equal(new Set(media.map((item) => item.src)).size, 18);
  for (const item of media) {
    assert.equal(item.type, "image");
    assert.ok(item.src.startsWith(approvedRoot));
    assert.match(item.src, /\/gallery-clean\/\d{2}-[a-z-]+\.png$/);
    assert.doesNotMatch(item.src, /cover|manifest|readme|contact|\.\./i);
  }
});

test("all eighteen repository PNG headers match their declared dimensions", () => {
  for (const item of projects.flatMap((project) => project.media)) {
    const png = readFileSync(new URL(`../public${item.src}`, import.meta.url));
    assert.ok(png.length >= 33, item.src);
    assert.deepEqual(png.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), item.src);
    assert.equal(png.readUInt32BE(8), 13, item.src);
    assert.equal(png.toString("ascii", 12, 16), "IHDR", item.src);
    assert.equal(png.readUInt32BE(16), item.width, item.src);
    assert.equal(png.readUInt32BE(20), item.height, item.src);
  }
});

test("concepts and development captures are not presented as verified gameplay", () => {
  const media = projects[2].media;
  for (const item of media.slice(0, 2)) {
    assert.match(item.label!, /concept/);
    assert.match(item.alt, /^Illustrated .*concept, not /);
  }
  for (const index of [2, 5, 6, 7, 8, 9]) {
    assert.match(media[index].label!, /Scene view/);
    assert.match(media[index].alt, /^Unity Scene view .*development/);
  }
  assert.match(media[3].alt, /^Unity Game view .*game-over screen$/);
  assert.match(media[4].alt, /development capture .*castle scene and character sprites/);
});

test("client media snapshots contain only allowed display metadata", () => {
  const allowed = ["alt", "height", "label", "src", "type", "width"];
  for (const project of projects) {
    const snapshot = project.toSnapshot();
    assert.deepEqual(JSON.parse(JSON.stringify(snapshot)).media, snapshot.media);
    for (const item of snapshot.media) {
      assert.deepEqual(Object.keys(item).sort(), allowed);
    }
  }
});

test("portfolio contains exactly eight TCGC and ten BlazingHeart images in approved order", () => {
  assert.deepEqual(projects.map((project) => project.media.length), [8, 0, 10, 0, 0]);
  assert.deepEqual(projects[0].toSnapshot().media, tcgc);
  assert.deepEqual(projects[2].toSnapshot().media, blazing);
  assert.equal(projects.flatMap((project) => project.media).length, 18);
  for (const index of [1, 3, 4]) {
    assert.deepEqual(projects[index].media, []);
    assert.equal(projects[index].hasMedia, false);
  }
});
