# Text Minify

A lightweight VSCode extension that automatically generates **`.min.js`** , **`.min.css`**, **`.min.json`** files on save.

Supports ES6+, modern JavaScript operators (including **`??`**), and **CSS** compression.


---

## ✨ Features

* Automatically generate `*.min.js` on save
* Automatically generate `*.min.css` on save
* Automatically generate `*.min.json` on save
* Supports ES6+, optional chaining, nullish coalescing (`??`)
* Uses **Terser** for JS and **clean-css** for CSS
* Customizable minified file suffix (default: `.min`)
* Zero‑config — works instantly
* Lightweight, fast, no TypeScript

---

## ⚙️ Configuration

In VSCode `settings.json`:

```json
{
    "textMinify.suffix": "min", // 自定义压缩文件后缀
    "textMinify.dropConsole": true // 是否删除 console.log
}
```

Change `.min` to your own suffix, such as `.compressed`.

---





# 文本压缩

一个轻量级的 VSCode 扩展，可在保存时自动生成 **`.min.js`** 、 **`.min.css`** 、 **`.min.json`** 文件。

支持 ES6+、现代 JavaScript 运算符（包括 **`??`**）和 CSS 压缩。


---

## ✨ 功能

* 保存时自动生成 `*.min.js` 文件

* 保存时自动生成 `*.min.css` 文件

* 保存时自动生成 `*.min.json` 文件

* 支持 ES6+、可选链式调用和空值合并（`??`）

* 使用 **Terser** 处理 JS 文件，使用 **clean-css** 处理 CSS 文件

* 可自定义压缩文件后缀（默认：`.min`）

* 零配置 — 即刻生效

* 轻量级、快速、无需 TypeScript

---

## ⚙️ 配置

在 VSCode 的 `settings.json` 文件中：

```json
{
    "textMinify.suffix": "min", // 自定义压缩文件后缀
    "textMinify.dropConsole": true // 是否删除 console.log
}
```

将 `.min` 替换为您自己的后缀，例如 `.compressed`。