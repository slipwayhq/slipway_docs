---
sidebar_position: 1
---

# Manually Packaging Components

The recommended way of packaging a Slipway Component into a TAR file is to
use the `slipway package` [CLI command](/docs/guides/slipway-cli).

However if you want to manually package a Component you can use this script as a guide.
The following script assumes you have your Component files in the `/components/my.component` folder.

```sh
# Create a TAR file from the folder.
tar -cf components/my.component.tar -C components/my.component .

# Extract the publisher, name and version from the `slipway_component.json`.
publisher=$(jq -r '.publisher' components/my.component/slipway_component.json)
name=$(jq -r '.name' components/my.component/slipway_component.json)
version=$(jq -r '.version' components/my.component/slipway_component.json)

# Create the new file name.
new_filename="${publisher}.${name}.${version}"

# Rename the TAR file to the correct file name.
mv components/my.component.tar "components/$new_filename.tar"
```

