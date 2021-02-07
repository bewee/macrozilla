import sys
import json

node_versions = {8: 57, 10: 64, 12: 72, 14: 83}
platforms = ['linux-arm', 'linux-arm64', 'linux-x64', 'darwin-x64']
release_url = 'https://github.com/bewee/macrozilla/releases/download'
license_url = 'https://raw.githubusercontent.com/bewee/macrozilla/master/LICENSE.md'
json_file = 'macrozilla.json'

release_version = sys.argv[1]

fm = open('manifest.json')
manifest = json.load(fm)
addon_id = manifest['id']
addon_name = manifest['name']
addon_description = manifest['description']
addon_author = manifest['author']
addon_homepage_url = manifest['homepage_url']
addon_primary_type = manifest['gateway_specific_settings']['webthings']['primary_type']

f = open(json_file, 'w')
f.write(
'{\n'
f'  "id": "{addon_id}",\n'
f'  "name": "{addon_name}",\n'
f'  "description": "{addon_description}",\n'
f'  "author": "{addon_author}",\n'
f'  "homepage_url": "{addon_homepage_url}",\n'
f'  "license_url": "{license_url}",\n'
f'  "primary_type": "{addon_primary_type}",\n'
'  "packages": [\n'
)

fm.close()

first_iteration = True
for node_version in node_versions:
    for platform in platforms:
        if first_iteration:
            first_iteration = False
        else:
            f.write(',\n')
        fc = open(f'{addon_id}-{release_version}-{platform}-v{node_version}.tgz.sha256sum', 'r')
        checksum = fc.read().split(' ')[0]
        fc.close()
        f.write(
        '    {\n'
        f'      "architecture": "{platform}",\n'
        '      "language": {\n'
        '        "name": "nodejs",\n'
        '        "versions": [\n'
        f'          "{node_versions[node_version]}"\n'
        '        ]\n'
        '      },\n'
        f'      "version": "{release_version}",\n'
        f'      "url": "{release_url}/v{release_version}/{addon_id}-{release_version}-{platform}-v{node_version}.tgz",\n'
        f'      "checksum": "{checksum}",\n'
        '      "gateway": {\n'
        '        "min": "0.10.0",\n'
        '        "max": "*"\n'
        '      }\n'
        '    }'
        )

f.write('\n')
f.write(
'  ]\n'
'}\n'
)
f.close()
