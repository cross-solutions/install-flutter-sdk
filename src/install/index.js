"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const task = require("azure-pipelines-task-lib/task");
const tool = require("azure-pipelines-tool-lib/tool");
require("os");
const request = require("request-promise");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var flutterChannel = task.getInput('channel', true);
            var currentPlatform = yield getCurrentPlatform();
            var latestSdkVersion = yield findLatestSdkVersion(flutterChannel, currentPlatform);
            var versionSpec = `${latestSdkVersion}-${flutterChannel}`;
            yield downloadAndInstallSdk(versionSpec, flutterChannel, currentPlatform);
        }
        catch (err) {
            task.setResult(task.TaskResult.Failed, err.message);
        }
    });
}
function getCurrentPlatform() {
    return __awaiter(this, void 0, void 0, function* () {
        var platform = yield task.getPlatform();
        switch (platform) {
            case task.Platform.Windows:
                return 'windows';
            case task.Platform.Linux:
                return 'linux';
            case task.Platform.MacOS:
                return 'macos';
            default:
                throw Error('Unsupported platform');
        }
    });
}
function findLatestSdkVersion(channel, arch) {
    return __awaiter(this, void 0, void 0, function* () {
        var releasesUrl = `https://storage.googleapis.com/flutter_infra/releases/releases_${arch}.json`;
        var body = yield request.get(releasesUrl);
        var json = JSON.parse(body);
        var currentHash = json.current_release[channel];
        var current = json.releases.find((item) => item.hash === currentHash);
        return current.version.substring(1);
    });
}
function downloadAndInstallSdk(versionSpec, channel, platform) {
    return __awaiter(this, void 0, void 0, function* () {
        var downloadUrl = `https://storage.googleapis.com/flutter_infra/releases/${channel}/${platform}/flutter_${platform}_v${versionSpec}.zip`;
        console.log(`Downloading latest sdk version '${versionSpec}' from channel '${channel}' from ${downloadUrl}`);
        var sdkZipBundle = yield tool.downloadTool(downloadUrl);
        console.log(`Downloaded SDK zip bundle at ${sdkZipBundle}`);
        var sdkZipBundleDir = yield tool.extractZip(sdkZipBundle);
        console.log(`Extracted SDK zip bundle at ${sdkZipBundleDir}`);
        console.log('Caching Flutter sdk');
        tool.cacheDir(sdkZipBundleDir, 'Flutter', versionSpec, platform);
        var flutterSdkPath = sdkZipBundleDir + '/flutter/bin';
        var dartSdkPath = flutterSdkPath + '/cache/dart-sdk/bin';
        var pubCachePath = '$HOME/.pub-cache/bin';
        console.log(`Adding ${flutterSdkPath} PATH environment `);
        task.prependPath(flutterSdkPath);
        console.log(`Adding ${dartSdkPath} PATH environment `);
        task.prependPath(dartSdkPath);
        console.log(`Adding ${pubCachePath} PATH environment `);
        task.prependPath(pubCachePath);
    });
}
run();
