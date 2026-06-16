// swift-tools-version: 5.9
import PackageDescription

// DO NOT MODIFY THIS FILE - managed by Capacitor CLI commands
let package = Package(
    name: "CapApp-SPM",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "CapApp-SPM",
            targets: ["CapApp-SPM"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", exact: "8.4.0"),
        .package(name: "CapacitorApp", path: "../../../node_modules/.pnpm/@capacitor+app@8.1.0_@capacitor+core@8.4.0/node_modules/@capacitor/app"),
        .package(name: "CapacitorClipboard", path: "../../../node_modules/.pnpm/@capacitor+clipboard@8.0.1_@capacitor+core@8.4.0/node_modules/@capacitor/clipboard"),
        .package(name: "CapacitorDevice", path: "../../../node_modules/.pnpm/@capacitor+device@8.0.2_@capacitor+core@8.4.0/node_modules/@capacitor/device"),
        .package(name: "CapacitorHaptics", path: "../../../node_modules/.pnpm/@capacitor+haptics@8.0.2_@capacitor+core@8.4.0/node_modules/@capacitor/haptics"),
        .package(name: "CapacitorKeyboard", path: "../../../node_modules/.pnpm/@capacitor+keyboard@8.0.3_@capacitor+core@8.4.0/node_modules/@capacitor/keyboard"),
        .package(name: "CapacitorPreferences", path: "../../../node_modules/.pnpm/@capacitor+preferences@8.0.1_@capacitor+core@8.4.0/node_modules/@capacitor/preferences"),
        .package(name: "CapacitorStatusBar", path: "../../../node_modules/.pnpm/@capacitor+status-bar@8.0.2_@capacitor+core@8.4.0/node_modules/@capacitor/status-bar"),
        .package(name: "CapawesomeCapacitorAppUpdate", path: "../../../node_modules/.pnpm/@capawesome+capacitor-app-update@8.0.3_@capacitor+core@8.4.0/node_modules/@capawesome/capacitor-app-update"),
        .package(name: "CapawesomeCapacitorFilePicker", path: "../../../node_modules/.pnpm/@capawesome+capacitor-file-picker@8.0.2_@capacitor+core@8.4.0/node_modules/@capawesome/capacitor-file-picker"),
        .package(name: "CapgoCameraPreview", path: "../../../node_modules/.pnpm/@capgo+camera-preview@8.4.4_@capacitor+core@8.4.0/node_modules/@capgo/camera-preview"),
        .package(name: "CapgoCapacitorUpdater", path: "../../../node_modules/.pnpm/@capgo+capacitor-updater@8.49.1_@capacitor+core@8.4.0/node_modules/@capgo/capacitor-updater"),
        .package(name: "SentryCapacitor", path: "../../../node_modules/.pnpm/@sentry+capacitor@4.1.0_@capacitor+core@8.4.0_@sentry+vue@10.52.0_pinia@3.0.4_typescript@6.0._eo5w66rjro4wbi3qxjl4zps7xm/node_modules/@sentry/capacitor")
    ],
    targets: [
        .target(
            name: "CapApp-SPM",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                .product(name: "CapacitorApp", package: "CapacitorApp"),
                .product(name: "CapacitorClipboard", package: "CapacitorClipboard"),
                .product(name: "CapacitorDevice", package: "CapacitorDevice"),
                .product(name: "CapacitorHaptics", package: "CapacitorHaptics"),
                .product(name: "CapacitorKeyboard", package: "CapacitorKeyboard"),
                .product(name: "CapacitorPreferences", package: "CapacitorPreferences"),
                .product(name: "CapacitorStatusBar", package: "CapacitorStatusBar"),
                .product(name: "CapawesomeCapacitorAppUpdate", package: "CapawesomeCapacitorAppUpdate"),
                .product(name: "CapawesomeCapacitorFilePicker", package: "CapawesomeCapacitorFilePicker"),
                .product(name: "CapgoCameraPreview", package: "CapgoCameraPreview"),
                .product(name: "CapgoCapacitorUpdater", package: "CapgoCapacitorUpdater"),
                .product(name: "SentryCapacitor", package: "SentryCapacitor")
            ]
        )
    ]
)
