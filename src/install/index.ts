import task = require('azure-pipelines-task-lib/task');
import tool = require('azure-pipelines-tool-lib/tool');
import 'os';
import * as request from 'request-promise';

async function run() {
    try {
        var flutterChannel = task.getInput('channel', true);
        var currentPlatform = await getCurrentPlatform();
        var latestSdkVersion = await findLatestSdkVersion(flutterChannel, currentPlatform);
        var versionSpec = `${latestSdkVersion}-${flutterChannel}`;
        await downloadSdk(versionSpec, flutterChannel, currentPlatform);
    }
    catch (err) {
        task.setResult(task.TaskResult.Failed, err.message);
    }
}

async function getCurrentPlatform(): Promise<string> {
    var platform = await task.getPlatform();
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
}

async function findLatestSdkVersion(channel: string, arch: string): Promise<string> {
    var releasesUrl = `https://storage.googleapis.com/flutter_infra/releases/releases_${arch}.json`;
    var body = await request.get(releasesUrl);
    var json = JSON.parse(body);
    var currentHash = json.current_release[channel];
    var current = json.releases.find((item: { hash: any; }) => item.hash === currentHash);
    return current.version.substring(1);
}

async function downloadSdk(versionSpec: string, channel: string, platform: string) {
    var downloadUrl = `https://storage.googleapis.com/flutter_infra/releases/${channel}/${platform}/flutter_${platform}_v${versionSpec}.zip`;
    console.log(`Downloading latest sdk version '${versionSpec}' from channel '${channel}' from ${downloadUrl}`);

    var sdkZipBundle = await tool.downloadTool(downloadUrl);
    console.log(`Downloaded SDK zip bundle at ${sdkZipBundle}`);

    var sdkZipBundleDir = await tool.extractZip(sdkZipBundle);
    console.log(`Extracted SDK zip bundle at ${sdkZipBundleDir}`);

    console.log('Caching Flutter sdk');
    tool.cacheDir(sdkZipBundleDir, 'Flutter', versionSpec, platform);

    var flutterSdkPath = sdkZipBundleDir + '/flutter/bin';
    console.log(`Adding ${flutterSdkPath}  PATH environment `);
    task.prependPath(flutterSdkPath);
}

run();