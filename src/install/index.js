"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var task = require("azure-pipelines-task-lib/task");
var tool = require("azure-pipelines-tool-lib/tool");
require("os");
var request = require("request-promise");
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var flutterChannel, currentPlatform, latestSdkInformation, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    flutterChannel = task.getInput('channel', true);
                    return [4 /*yield*/, getCurrentPlatform()];
                case 1:
                    currentPlatform = _a.sent();
                    return [4 /*yield*/, findLatestSdkInformation(flutterChannel, currentPlatform)];
                case 2:
                    latestSdkInformation = _a.sent();
                    return [4 /*yield*/, downloadAndInstallSdk(latestSdkInformation.downloadUrl, latestSdkInformation.version, currentPlatform)];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    err_1 = _a.sent();
                    task.setResult(task.TaskResult.Failed, err_1.message);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function getCurrentPlatform() {
    return __awaiter(this, void 0, void 0, function () {
        var platform;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, task.getPlatform()];
                case 1:
                    platform = _a.sent();
                    switch (platform) {
                        case task.Platform.Windows:
                            return [2 /*return*/, 'windows'];
                        case task.Platform.Linux:
                            return [2 /*return*/, 'linux'];
                        case task.Platform.MacOS:
                            return [2 /*return*/, 'macos'];
                        default:
                            throw Error('Unsupported platform');
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function findLatestSdkInformation(channel, arch) {
    return __awaiter(this, void 0, void 0, function () {
        var releasesUrl, body, json, currentHash, current;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    releasesUrl = "https://storage.googleapis.com/flutter_infra/releases/releases_" + arch + ".json";
                    return [4 /*yield*/, request.get(releasesUrl)];
                case 1:
                    body = _a.sent();
                    json = JSON.parse(body);
                    currentHash = json.current_release[channel];
                    current = json.releases.find(function (item) { return item.hash === currentHash; });
                    json.releases.forEach(function (element) {
                        console.log("Found: " + element.archive);
                    });
                    return [2 /*return*/, {
                            downloadUrl: json.base_url + '/' + current.archive,
                            version: channel + '-' + current.version.substring(1)
                        }];
            }
        });
    });
}
function downloadAndInstallSdk(latestSdkDownloadUrl, version, arch) {
    return __awaiter(this, void 0, void 0, function () {
        var sdkBundle, sdkExtractedBundleDir, flutterSdkPath, dartSdkPath, pubCachePath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Downloading latest sdk from " + latestSdkDownloadUrl);
                    return [4 /*yield*/, tool.downloadTool(latestSdkDownloadUrl)];
                case 1:
                    sdkBundle = _a.sent();
                    console.log("Downloaded SDK zip bundle at " + latestSdkDownloadUrl);
                    if (!latestSdkDownloadUrl.includes('tar.xz')) return [3 /*break*/, 3];
                    return [4 /*yield*/, tool.extractTar(sdkBundle)];
                case 2:
                    sdkExtractedBundleDir = _a.sent();
                    console.log("Extracted SDK Tar bundle at " + sdkExtractedBundleDir);
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, tool.extractZip(sdkBundle)];
                case 4:
                    sdkExtractedBundleDir = _a.sent();
                    console.log("Extracted SDK Zip bundle at " + sdkExtractedBundleDir);
                    _a.label = 5;
                case 5:
                    console.log('Caching Flutter sdk');
                    tool.cacheDir(sdkExtractedBundleDir, 'Flutter', version, arch);
                    flutterSdkPath = sdkExtractedBundleDir + '/flutter/bin';
                    dartSdkPath = flutterSdkPath + '/cache/dart-sdk/bin';
                    pubCachePath = process.env.HOME + '/.pub-cache/bin';
                    console.log("Adding " + flutterSdkPath + " PATH environment ");
                    task.prependPath(flutterSdkPath);
                    console.log("Adding " + dartSdkPath + " PATH environment ");
                    task.prependPath(dartSdkPath);
                    console.log("Adding " + pubCachePath + " PATH environment ");
                    task.prependPath(pubCachePath);
                    return [2 /*return*/];
            }
        });
    });
}
run();
