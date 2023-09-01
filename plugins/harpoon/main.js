/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => HarpoonPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian3 = require("obsidian");

// src/utils.ts
var import_obsidian = require("obsidian");

// src/constants.ts
var MAX_ATTEMPTS = 10;
var CACHE_FILE = "harpoon-cache.json";

// src/utils.ts
var HarpoonUtils = class {
  constructor(app) {
    this.isOpen = false;
    this.hookedFiles = [];
    this.app = app;
  }
  onOpen() {
    this.isOpen = true;
  }
  onClose() {
    this.isOpen = false;
  }
  getLeaf() {
    return this.app.workspace.getLeaf();
  }
  // Checks until the editor is loaded and active then jumps to the cursor
  editorIsLoaded(cb) {
    var _a;
    if ((_a = this.app.workspace) == null ? void 0 : _a.activeEditor) {
      cb && cb();
      this.jumpToCursor();
      return true;
    } else {
      setTimeout(() => this.editorIsLoaded(), 100);
      return false;
    }
  }
  getActiveFile() {
    return this.app.workspace.getActiveFile();
  }
  getEditor() {
    var _a;
    return (_a = this.app.workspace.activeEditor) == null ? void 0 : _a.editor;
  }
  getHookedFile(filepath) {
    const hookedFile = this.pathToFile(filepath);
    return hookedFile;
  }
  getCursorPos() {
    const editor = this.getEditor();
    return editor && (editor == null ? void 0 : editor.getCursor());
  }
  setCursorPos(cursor) {
    const editor = this.getEditor();
    editor == null ? void 0 : editor.setCursor(cursor);
  }
  onChooseItem(file) {
    const hookedFile = this.getHookedFile(file.path);
    this.getLeaf().openFile(hookedFile);
    this.updateFile(this.getActiveFile());
    this.jumpToCursor();
  }
  pathToFile(filepath) {
    const file = this.app.vault.getAbstractFileByPath(filepath);
    if (file instanceof import_obsidian.TFile)
      return file;
    return null;
  }
  // Cursor handling
  async jumpToCursor() {
    let activeFile = null;
    let attempts = 0;
    while (!activeFile && attempts < MAX_ATTEMPTS) {
      activeFile = this.getActiveFile();
      attempts++;
    }
    if (!activeFile) {
      console.log("Failed to get the active file.");
      return;
    }
    const file = this.hookedFiles.find(
      (f) => f.path === (activeFile == null ? void 0 : activeFile.path)
    );
    if (!file) {
      console.log("Active file is not found in the hooked files.");
      return;
    }
    this.setCursorPos(file.cursor);
  }
  async updateFile(file) {
    return this.hookedFiles.map((f) => {
      if (f.path === file.path) {
        f.cursor = this.getCursorPos();
      }
    });
  }
  async wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
};

// src/harpoon_modal.ts
var import_obsidian2 = require("obsidian");
var HarpoonModal = class extends import_obsidian2.Modal {
  constructor(app, writeToCache, utils) {
    super(app);
    this.hookedFileIdx = 0;
    this.lastKeyPressTime = 0;
    this.hookedFiles = utils.hookedFiles;
    this.writeToCache = writeToCache;
    this.utils = utils;
  }
  // Lifecycle methods
  onOpen() {
    this.utils.isOpen = true;
    this.setupUI();
    this.renderHookedFiles();
  }
  onClose() {
    this.utils.isOpen = false;
    this.contentEl.empty();
  }
  // UI helper methods
  setupUI() {
    this.titleEl.setText("Harpoon");
    this.titleEl.className = "inline-title";
    this.modalEl.tabIndex = 0;
  }
  renderHookedFiles() {
    this.contentEl.empty();
    if (!this.hookedFiles.length) {
      this.contentEl.createEl("p", { text: "No hooked files" });
      return;
    }
    this.hookedFiles.forEach((hookedFile, idx) => {
      const hookedEl = this.contentEl.createEl("div", {
        text: `${idx + 1}. ${hookedFile.path}`,
        cls: "hooked-file tree-item-self is-clickable nav-file-title"
      });
      hookedEl.dataset.id = `hooked-file-${idx}`;
      hookedEl.id = `hooked-file-${idx}`;
    });
    this.hookedFileIdx = 0;
    this.highlightHookedFile(0);
  }
  highlightHookedFile(idx) {
    const hookedElements = document.getElementsByClassName("hooked-file");
    Array.from(hookedElements).forEach((element) => {
      element.classList.remove("is-active");
    });
    const hookedEl = document.getElementById(`hooked-file-${idx}`);
    hookedEl == null ? void 0 : hookedEl.classList.add("is-active");
  }
  // Action handlers
  handleSelection(index) {
    var _a;
    const isNotActive = ((_a = this.utils.getActiveFile()) == null ? void 0 : _a.path) !== this.hookedFiles[index].path;
    if (isNotActive) {
      const fileToOpen = this.utils.getHookedFile(
        this.hookedFiles[index].path
      );
      this.utils.getLeaf().openFile(fileToOpen);
      this.utils.jumpToCursor();
      this.close();
      return;
    }
    this.close();
  }
  removeFromHarpoon(idx) {
    if (idx >= 0 && idx < this.hookedFiles.length) {
      this.lastRemoved = this.hookedFiles.splice(idx, 1)[0];
      this.writeToCache(this.hookedFiles);
      this.renderHookedFiles();
    }
  }
  insertFileAt(pos) {
    if (this.lastRemoved && !this.hookedFiles.includes(this.lastRemoved) && this.hookedFiles.length <= 4) {
      this.hookedFiles.splice(pos, 0, this.lastRemoved);
      this.writeToCache(this.hookedFiles);
      this.renderHookedFiles();
    }
  }
  moveSelection(direction) {
    this.hookedFileIdx = Math.max(
      0,
      Math.min(this.hookedFileIdx + direction, 3)
    );
  }
  resetSelection() {
    this.hookedFileIdx = this.hookedFileIdx === 0 ? this.hookedFiles.length - 1 : 0;
  }
};

// src/main.ts
var DEFAULT_SETTINGS = {
  fileOne: null,
  fileTwo: null,
  fileThree: null,
  fileFour: null
};
var HarpoonPlugin = class extends import_obsidian3.Plugin {
  constructor(app, manifest) {
    super(app, manifest);
    this.isLoaded = false;
    this.utils = new HarpoonUtils(app);
  }
  onload() {
    this.loadSettings();
    this.loadHarpoonCache();
    this.registerCommands();
    this.registerDomEvents();
    this.utils.editorIsLoaded();
  }
  loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS);
  }
  registerCommands() {
    this.addCommand({
      id: "open",
      name: "Open file list",
      callback: () => {
        this.modal = new HarpoonModal(
          this.app,
          (hFiles) => this.writeHarpoonCache(hFiles),
          this.utils
        );
        this.modal.open();
      }
    });
    this.addCommand({
      id: "add",
      name: "Add file to list",
      callback: () => {
        const file = this.utils.getActiveFile();
        if (file) {
          this.addToHarpoon(file);
          return;
        }
        this.showInStatusBar(`There was no file to add.`);
      }
    });
    const goToFiles = [
      { id: 1, name: "Go To File 1" },
      { id: 2, name: "Go To File 2" },
      { id: 3, name: "Go To File 3" },
      { id: 4, name: "Go To File 4" }
    ];
    for (const file of goToFiles) {
      this.addCommand({
        id: `go-to-${file.id}`,
        name: `${file.name}`,
        callback: () => {
          this.utils.onChooseItem(
            this.utils.hookedFiles[file.id - 1]
          );
          setTimeout(() => {
            this.utils.jumpToCursor();
          }, 100);
        }
      });
    }
  }
  registerDomEvents() {
    this.registerDomEvent(
      document,
      "keydown",
      this.handleKeyDown.bind(this)
    );
  }
  handleKeyDown(evt) {
    const { modal } = this;
    if (!modal || !this.utils.isOpen)
      return;
    if (evt.ctrlKey && evt.shiftKey && evt.code === "KeyD" /* D */) {
      modal.close();
    } else if (evt.ctrlKey) {
      this.handleCtrlKeyCommands(evt);
    } else {
      this.handleRegularCommands(evt);
    }
  }
  handleCtrlKeyCommands(evt) {
    const { modal } = this;
    switch (evt.code) {
      case "KeyH" /* H */:
        modal.handleSelection(0);
        break;
      case "KeyT" /* T */:
        modal.handleSelection(1);
        break;
      case "KeyN" /* N */:
        modal.handleSelection(2);
        break;
      case "KeyS" /* S */:
        modal.handleSelection(3);
        break;
    }
  }
  handleRegularCommands(evt) {
    const { modal } = this;
    switch (evt.code) {
      case "Enter" /* Enter */:
        modal.handleSelection(modal.hookedFileIdx);
        break;
      case "KeyD" /* D */:
        const currentTime = new Date().getTime();
        if (currentTime - modal.lastKeyPressTime <= 500) {
          modal.removeFromHarpoon(modal.hookedFileIdx);
          break;
        }
        modal.lastKeyPressTime = currentTime;
        break;
      case "KeyP" /* P */:
        if (evt.shiftKey) {
          modal.insertFileAt(modal.hookedFileIdx);
        } else {
          modal.insertFileAt(modal.hookedFileIdx + 1);
        }
        break;
      case "ArrowDown" /* ArrowDown */:
      case "KeyJ" /* J */:
        if (modal.hookedFileIdx === this.utils.hookedFiles.length - 1) {
          modal.resetSelection();
          modal.highlightHookedFile(modal.hookedFileIdx);
        } else {
          modal.moveSelection(1 /* Down */);
          modal.highlightHookedFile(modal.hookedFileIdx);
        }
        break;
      case "ArrowUp" /* ArrowUp */:
      case "KeyK" /* K */:
        if (modal.hookedFileIdx === 0) {
          modal.resetSelection();
          modal.highlightHookedFile(modal.hookedFileIdx);
        } else {
          modal.moveSelection(-1 /* Up */);
          modal.highlightHookedFile(modal.hookedFileIdx);
        }
        break;
      default:
        break;
    }
  }
  loadHarpoonCache() {
    console.log("Loading file");
    this.app.vault.adapter.read(CACHE_FILE).then((content) => {
      console.log("Loaded file");
      this.utils.hookedFiles = JSON.parse(content);
    }).catch(() => {
      console.log("No file found, building...");
      this.writeHarpoonCache();
    });
  }
  // Updates the cache file and the hookedFiles
  writeHarpoonCache(hookedFiles = null) {
    this.app.vault.adapter.write(
      CACHE_FILE,
      JSON.stringify(this.utils.hookedFiles, null, 2)
    );
    if (hookedFiles) {
      this.utils.hookedFiles = hookedFiles;
    }
  }
  async addToHarpoon(file) {
    if (this.utils.hookedFiles.some((f) => f.path === file.path)) {
      return;
    }
    if (this.utils.hookedFiles.length <= 4) {
      this.utils.hookedFiles.push({
        ctime: file.stat.ctime,
        path: file.path,
        title: file.name,
        cursor: this.utils.getCursorPos()
      });
      this.writeHarpoonCache();
      this.showInStatusBar(`File ${file.name} added to harpoon`);
    }
  }
  // Visual queues
  showInStatusBar(text, time = 5e3) {
    const statusBarItemEl = this.addStatusBarItem();
    statusBarItemEl.setText(text);
    setTimeout(() => {
      statusBarItemEl.remove();
    }, time);
  }
};