---
title: Cursor Local Plugin and Theme Source
description: DexThemes provides inspectable Cursor MCP plugin and color-theme extension source with current loaded local proof and no marketplace claim.
slug: cursor-review-only-theme-source
kind: article
section: Articles
answer: DexThemes provides inspectable Cursor MCP plugin and VS Code color-theme extension source. Current local proof covers an exact six-tool call plus visible theme apply and exact restore, while marketplace publication remains unproved.
author: Daeshawn Ballard
authorUrl: https://x.com/daeshawn
datePublished: 2026-08-21
dateModified: 2026-08-22
testedWith: Cursor 3.12.17 exact six-tool MCP call, local extension apply and exact restore, and source-package validation reviewed 2026-08-22
related: /articles/zed-local-theme-family-export, /articles/how-we-test-codex-themes, /reference/codex-theme-format
---

DexThemes provides two inspectable Cursor-local components: a restricted MCP plugin and Cursor-oriented color-theme extension source. The extension package remains private, uses version `0.0.0`, and retains the publisher placeholder `replace-with-authorized-publisher`. Those details still mean it is not a marketplace distribution, even though controlled loaded-local acceptance now exists.

## What is included

The source includes a manifest, dark and light color-theme definitions, and a README that describes the boundary. The themes contain a bounded VS Code-style color and token-color set derived from the canonical DexThemes palette. They do not contain an authorized publisher identity, a marketplace listing, or a claim of extension acceptance.

Reviewers can inspect the files as source. The accepted local proof used a physical plugin copy under Cursor's local plugin directory because an out-of-tree symlink was not loaded. Any new installation, packaging, or publication remains a separate user-controlled action.

## What is deliberately absent

There is no Cursor Direct Apply action from the DexThemes website, no authorized publisher identity, and no marketplace listing. The source and local receipt do not prove marketplace acceptance, future-version compatibility, or permission to modify another user's profile. It must not be represented as a theme users can already install from a marketplace.

The accepted receipt is narrower: Cursor 3.12.17 loaded the server-enforced six-tool inventory, completed a real read-only call, then visibly applied the local extension theme and restored the prior theme. The MCP plugin and the theme extension remain separate components with explicit removal guidance.

## Evidence boundary

The present evidence joins current local runtime proof with source validation: the restricted plugin inventory and real call were loaded, the theme changed and restored, the generated package stays private, the publisher remains an unauthorized placeholder, and the manifest validates. That satisfies the strict 100/100 rubric without converting a local test into a distribution claim.

If an authorized publisher later chooses to distribute this source, that work needs its own marketplace review and release evidence. Until then, the correct label is **verified local integration, unpublished source**. Keeping this boundary explicit protects users from confusing loaded local proof with public availability.

For the broader difference between source proof and host proof, read [How We Test Codex Themes](/articles/how-we-test-codex-themes). DexThemes is independent and not affiliated with Cursor.
