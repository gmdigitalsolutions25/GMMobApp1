#!/usr/bin/env python3
"""
Inject release signing configuration into Expo-generated build.gradle.
Run AFTER 'expo prebuild --platform android' and BEFORE './gradlew bundleRelease'.

Usage:
    python3 scripts/configure_release_signing.py

Expects the keystore file to already be at android/app/qaraj-release.jks
and environment variables KEYSTORE_PASSWORD, KEY_ALIAS, KEY_PASSWORD to be set at build time.
"""
import re
import sys

BUILD_GRADLE = "android/app/build.gradle"

with open(BUILD_GRADLE, "r") as f:
    content = f.read()

print("=== Original buildTypes section ===")
bt_match = re.search(r"buildTypes\s*\{.*?\n    \}", content, re.DOTALL)
if bt_match:
    print(bt_match.group()[:500])
else:
    print("WARNING: Could not find buildTypes section")

# Step 1: Add signingConfigs block before buildTypes
SIGNING_BLOCK = (
    '    signingConfigs {\n'
    '        release {\n'
    '            storeFile file("qaraj-release.jks")\n'
    '            storePassword System.getenv("KEYSTORE_PASSWORD")\n'
    '            keyAlias System.getenv("KEY_ALIAS")\n'
    '            keyPassword System.getenv("KEY_PASSWORD")\n'
    '        }\n'
    '    }\n'
)

if "signingConfigs" not in content:
    content = content.replace("    buildTypes {", SIGNING_BLOCK + "    buildTypes {")
    print("Inserted signingConfigs block")
else:
    print("signingConfigs already present, skipping insertion")

# Step 2: Add signingConfig to release buildType
content = re.sub(
    r"(release\s*\{)",
    r"\1\n            signingConfig signingConfigs.release",
    content,
    count=1,
)
print("Added signingConfig to release buildType")

# Step 3: Set debuggableVariants = [] to bundle JS into release builds
content = content.replace(
    '// debuggableVariants = ["liteDebug", "prodDebug"]',
    'debuggableVariants = []',
)
print("Set debuggableVariants = []")

with open(BUILD_GRADLE, "w") as f:
    f.write(content)

# Verify
print("\n=== Modified signing section ===")
sc_match = re.search(r"signingConfigs\s*\{.*?\n    \}", content, re.DOTALL)
if sc_match:
    print(sc_match.group())

bt_match = re.search(r"buildTypes\s*\{.*?\n    \}", content, re.DOTALL)
if bt_match:
    print(bt_match.group()[:500])

print("\nbuild.gradle signing configured successfully")
sys.exit(0)
