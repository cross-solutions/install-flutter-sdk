import task = require('azure-pipelines-task-lib/task');
import tool = require('azure-pipelines-tool-lib/tool');
import 'os';
import * as request from 'request-promise';

async function run() {
    try {
        var flutterChannel = task.getInput('channel', true);
        var currentPlatform = await getCurrentPlatform();
        var latestSdkInformation = await findLatestSdkInformation(flutterChannel, currentPlatform);
        await downloadAndInstallSdk(latestSdkInformation.downloadUrl, latestSdkInformation.version, currentPlatform);
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

async function findLatestSdkInformation(channel: string, arch: string): Promise<{ downloadUrl: string, version: string }> {
    var releasesUrl = `https://storage.googleapis.com/flutter_infra/releases/releases_${arch}.json`;
    var body = await request.get(releasesUrl);
    var json = JSON.parse(body);
    var currentHash = json.current_release[channel];
    var current = json.releases.find((item: { hash: any; }) => item.hash === currentHash);
    return {
        downloadUrl: json.base_url + '/' + current.archive,
        version: channel + '-' + current.version.substring(1)
    };
}

async function downloadAndInstallSdk(latestSdkDownloadUrl: string, version: string, arch: string) {
    console.log(`Downloading latest sdk from ${latestSdkDownloadUrl}`);
    var sdkBundle = await tool.downloadTool(latestSdkDownloadUrl);
    console.log(`Downloaded SDK zip bundle at ${latestSdkDownloadUrl}`);

    var sdkExtractedBundleDir;
    if (latestSdkDownloadUrl.includes('tar.xz')) {
        sdkExtractedBundleDir = await tool.extractTar(sdkBundle);
        console.log(`Extracted SDK Tar bundle at ${sdkExtractedBundleDir}`);
    } else {
        sdkExtractedBundleDir = await tool.extractZip(sdkBundle);
        console.log(`Extracted SDK Zip bundle at ${sdkExtractedBundleDir}`);
    }

    console.log('Caching Flutter sdk');
    tool.cacheDir(sdkExtractedBundleDir, 'Flutter', version, arch);

    var flutterSdkPath = sdkExtractedBundleDir + '/flutter/bin';
    var dartSdkPath = flutterSdkPath + '/cache/dart-sdk/bin';
    var pubCachePath = process.env.HOME + '/.pub-cache/bin';

    console.log(`Adding ${flutterSdkPath} PATH environment `);
    task.prependPath(flutterSdkPath);

    console.log(`Adding ${dartSdkPath} PATH environment `);
    task.prependPath(dartSdkPath);

    console.log(`Adding ${pubCachePath} PATH environment `);
    task.prependPath(pubCachePath);
}

run();