#!/usr/bin/env python3
"""
Inject release signing configuration into Expo-generated build.gradle.
Run AFTER 'expo prebuild --platform android' and BEFORE './gradlew bundleRelease'.

Handles the case where Expo already generates a signingConfigs block with
a 'debug' entry — we add a 'release' entry alongside it.

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

print("=== Original signingConfigs section ===")
sc_match = re.search(r"signingConfigs\s*\{.*?\n    \}", content, re.DOTALL)
if sc_match:
    print(sc_match.group())
else:
    print("No signingConfigs found")

print("\n=== Original buildTypes section ===")
bt_match = re.search(r"buildTypes\s*\{.*?\n    \}", content, re.DOTALL)
if bt_match:
    print(bt_match.group())
else:
    print("No buildTypes found")

# ── Step 1: Add 'release' entry inside existing signingConfigs block ──────────
# Expo generates:
#   signingConfigs {
#       debug {
#           storeFile file('debug.keystore')
#           ...
#       }
#   }
# We need to add a 'release' block after the 'debug' block.

RELEASE_SIGNING = """        release {
            storeFile file("qaraj-release.jks")
            storePassword System.getenv("KEYSTORE_PASSWORD")
            keyAlias System.getenv("KEY_ALIAS")
            keyPassword System.getenv("KEY_PASSWORD")
        }"""

if "signingConfigs" in content:
    if "release {" not in content.split("signingConfigs")[1].split("buildTypes")[0]:
        # Find the closing brace of the debug block inside signingConfigs
        # Pattern: signingConfigs { ... debug { ... } \n    }
        # We insert the release block before the closing } of signingConfigs
        content = re.sub(
            r"(signingConfigs\s*\{[^}]*\})([ \t]*\n[ \t]*\})",
            r"\1\n" + RELEASE_SIGNING + r"\2",
            content,
            count=1,
        )
        print("\nInserted release signing config inside existing signingConfigs block")
    else:
        print("\nrelease signing config already present in signingConfigs")
else:
    # No signingConfigs at all — add the full block before buildTypes
    full_block = (
        "    signingConfigs {\n"
        "        release {\n"
        '            storeFile file("qaraj-release.jks")\n'
        '            storePassword System.getenv("KEYSTORE_PASSWORD")\n'
        '            keyAlias System.getenv("KEY_ALIAS")\n'
        '            keyPassword System.getenv("KEY_PASSWORD")\n'
        "        }\n"
        "    }\n"
    )
    content = content.replace("    buildTypes {", full_block + "    buildTypes {")
    print("\nInserted new signingConfigs block before buildTypes")

# ── Step 2: Replace signingConfig in release buildType ────────────────────────
# Expo generates: signingConfig signingConfigs.debug inside the release block
# We need to REPLACE it with signingConfigs.release, not add a second line

content = re.sub(
    r"(release\s*\{[^}]*?)signingConfig\s+signingConfigs\.debug",
    r"\1signingConfig signingConfigs.release",
    content,
    count=1,
)
print("Replaced signingConfig in release buildType: debug → release")

# ── Step 3: Set debuggableVariants = [] to bundle JS into release ─────────────
content = content.replace(
    '// debuggableVariants = ["liteDebug", "prodDebug"]',
    'debuggableVariants = []',
)
print("Set debuggableVariants = []")

# ── Write result ──────────────────────────────────────────────────────────────
with open(BUILD_GRADLE, "w") as f:
    f.write(content)

# ── Verify ────────────────────────────────────────────────────────────────────
print("\n=== Modified signingConfigs section ===")
sc_match = re.search(r"signingConfigs\s*\{.*?\n    \}", content, re.DOTALL)
if sc_match:
    print(sc_match.group())

print("\n=== Modified buildTypes section ===")
bt_match = re.search(r"buildTypes\s*\{.*?\n    \}", content, re.DOTALL)
if bt_match:
    print(bt_match.group())

# Sanity check: make sure signingConfigs.release exists
if "signingConfigs.release" not in content:
    print("\n❌ ERROR: signingConfigs.release not found in output!")
    sys.exit(1)

# Sanity check: release buildType should NOT reference signingConfigs.debug
release_block = re.search(r"release\s*\{[^}]+\}", content)
if release_block and "signingConfigs.debug" in release_block.group():
    print("\n❌ ERROR: release buildType still references signingConfigs.debug!")
    sys.exit(1)

print("\n✅ build.gradle signing configured successfully")
sys.exit(0)
