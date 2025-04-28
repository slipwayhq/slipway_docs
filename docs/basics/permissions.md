---
sidebar_position: 60
---

# Permissions

Slipway is designed to safely execute arbitrary WASM and Javascript files written by others
on your local infrastructure. To achieve this, it follows a zero-trust security model:
 - It does not trust Rigs by default.
 - It does not trust Components by default.

Components are run in a sandbox, and cannot interact with the outside world unless given additional permissions.[^bugs]

[^bugs]: Assuming we have no security related bugs in either Slipway or the third-party libraries we use.
Please report any issues you find to our    [GitHub Issues](https://github.com/slipwayhq/slipway/issues).

## Permissions Chains
Slipway creates a "permission chain" when executing Rigs. Any actions must pass security checks *at every link in the chain* for the action to be successful.

- The first link in the chain is typically the permissions given to the Rig by the user who is running Slipway.
- The second link is typically the permissions given to a Component by the Rig itself.
- Subsequent links are the permissions given by parent Components to any child Components they call out to.

:::info[Example]
Take a scenario where a Rig runs the `slipwayhq.echarts` Component, which internally runs the `slipwayhq.svg` Component to render the chart from SVG.
The `echarts` Component gives the `svg` Component permission to access fonts.
However any font requests made by the `svg` Component will still fail unless the Rig also gives the `echarts` Component
permission to access fonts *and* the user gives the Rig permission to access fonts.
:::

This system allows you to download arbitrary Rigs and Components and run them locally,
knowing that neither the Rig nor its Components can do anything you haven't explicitly given them permission to do.

## Evaluation Order

The following occurs at each level in the Permissions chain:

Deny permissions are evaluated first, in the order given.
If any deny permissions match the action being taken by the Component then the action is rejected.

Depending on the action, a rejection may mean that an error is returned (for example in the case of
an HTTP request), or it may simply mean that nothing is returned (if a Component tries to read
an environment variable and doesn't have permission, it simply appears to the Component as if the environment
variable doesn't exist).

If no deny permissions match, then the allow permissions are evaluated in the order given.

If any allow permission matches the action being taken by the Component, then the action is allowed at that
link in the permissions chain.

If no allow permissions match the action being taken by the Component, then the action is rejected.

If the action is allowed at every link in the permissions chain, then Slipway allows the action to proceed.

## Supported Permissions

Permissions are either configured in JSON (as part of the [Rig](/docs/basics/rigs) 
or [Component](/docs/basics/components) configuration files,
or as part of the [`slipway serve`](/docs/basics/serving-rigs) config), or on the command line
when calling [`silpway run`](/docs/basics/running-rigs).

When specifying permissions on the command line, you can specify the same command line argument multiple
times to accumulate permissions. For example:

```
--allow-env-exact "KEY_1" --allow-env-exact "KEY_2"
```

We will go though all the supported permissions, giving examples of each permission as both a
command line argument and as a JSON object.

### All

Allow or deny all possible Component actions.

```sh title="CLI"
--allow-all 
--deny-all
```
```json title="JSON"
{ "permission": "all" }
```

### Http Requests

#### HTTP All

Allow or deny all HTTP requests.

```sh title="CLI"
--allow-http
--deny-http
```
```json title="JSON"
{ "permission": "http" }
```

#### HTTP Exact

Allow or deny specific HTTP requests.

```sh title="CLI"
--allow-http-exact "https://example.com/foo/bar.json"
--deny-http-exact "https://example.com/foo/bar.json"
```
```json title="JSON"
{ "permission": "http", "exact": "https://example.com/foo/bar.json" }
```

#### HTTP Prefix

Allow or deny all HTTP requests starting with the given prefix.

```sh title="CLI"
--allow-http-prefix "https://example.com/foo/"
--deny-http-prefix "https://example.com/foo/"
```
```json title="JSON"
{ "permission": "http", "prefix": "https://example.com/foo/" }
```

:::warning
The prefix here is a simple string prefix.
This means specifying a trailing slash may be important for your scenario.

The following permission, without a trailing slash...
```
--allow-http-prefix "https://example.com/foo"
```
... would allow all the following requests:
```
https://example.com/foo/bar.json
https://example.com/food.json
https://example.com/football-results/all.csv
```
:::

### Files

#### Files All

Allow or deny all local file requests.

```sh title="CLI"
--allow-files
--deny-files
```
```json title="JSON"
{ "permission": "files" }
```


#### Files Exact

Allow or deny specific local file requests.

```sh title="CLI"
--allow-files-exact "data/foo.json"
--deny-files-exact "data/foo.json"
```
```json title="JSON"
{ "permission": "files", "exact": "data/foo.json" }
```

#### Files Within

Allow or deny specific all local file requests within the specified folder.

```sh title="CLI"
--allow-files-within "data"
--deny-files-within "data/secret"
```
```json title="JSON"
{ "permission": "files", "within": "data" }
```

:::info
The word `within` is used here because the files permission does understand the concept of folders.

If the following permission is given:
```
--allow-files-within "data"
```

Then the following file requests are allowed:
```
data/foo.json
./data/bar.json
data/foo/bar.csv
```

And the following file requests would be rejected:
```
database.csv
bar/data/foo.json
../data/foo.json
/data/foo.json
```
:::

### Fonts

#### Fonts All

Allow or deny access to all fonts requests.

```sh title="CLI"
--allow-fonts
--deny-fonts
```
```json title="JSON"
{ "permission": "fonts" }
```

#### Fonts Exact

Allow or deny access to specific fonts.

```sh title="CLI"
--allow-fonts-exact <ALLOW_FONTS_EXACT>
--deny-fonts-exact <DENY_FONTS_EXACT>
```
```json title="JSON"
{ "permission": "fonts", "exact": "Comic Sans" }
```

:::info
Components make requests for fonts by passing a "font stack", which may look something like:
```
Helvetica, Arial, Comic Sans
```

If you specify the following permissions:
```
--allow-fonts-exact "Comic Sans" --allow-fonts-exact "Helvetica"
```

Then the example font stack would automatically get filtered down to just:
```
Helvetica, Comic Sans
```

After being filtered, the system fonts (and any additional supplied fonts) will be queried for a match.
If all fonts in the font stack are filtered out due to lack of permissions then the result is the
same as if no matching fonts were found on the system.
:::


#### Fonts Prefix

Allow or deny access to fonts starting with the given prefix.

```sh title="CLI"
--allow-fonts-prefix "Comic "
--deny-fonts-prefix "Comic "
```
```json title="JSON"
{ "permission": "fonts", "prefix": "Comic " }
```

Note that including the final space may or may not be important for your scenario.

#### Fonts Suffix

Allow or deny access to fonts ending with the given suffix.

```sh title="CLI"
--allow-fonts-suffix " Sans"
--deny-fonts-suffix " Sans"
```
```json title="JSON"
{ "permission": "fonts", "suffix": " Sans" }
```

Note that including the leading space may or may not be important for your scenario.


### Environment Variables

#### Env All

Allow or deny access to all environment variables.

```sh title="CLI"
--allow-env
--deny-env
```
```json title="JSON"
{ "permission": "env" }
```

#### Env Exact

Allow or deny access to specific environment variables.

```sh title="CLI"
--allow-env-exact "AWS_KEY"
--deny-env-exact "AWS_KEY"
```
```json title="JSON"
{ "permission": "env", "exact": "AWS_KEY" }
```

#### Env Prefix

Allow or deny access to environment variables starting with the given prefix.

```sh title="CLI"
--allow-env-prefix "AWS_"
--deny-env-prefix "AWS_"
```
```json title="JSON"
{ "permission": "env", "exact": "AWS_" }
```

#### Env Suffix

Allow or deny access to environment variables ending with the given suffix.

```sh title="CLI"
--allow-env-suffix "_DIR"
--deny-env-suffix "_DIR"
```
```json title="JSON"
{ "permission": "env", "exact": "_DIR" }
```

### Registry Components

A Registry Component is a component with a reference specifying a publisher, name and version
separated by periods. For example:
```
slipwayhq.render.1.0.0
```

#### Registry Components All

Allow or deny access to all Registry Components.

```sh title="CLI"
--allow-registry-components
--deny-registry-components
```
```json title="JSON"
{ "permission": "registry_components" }
```

#### Registry Components Matching

Allow or deny access to all Registry Components matching the given pattern.

For command line arguments, the pattern is specified as a string of the form `publisher.name.version_spec`.
Each part is optional, but the dots must be present.
For example:
```
"slipwayhq.render.1.0.0"
"slipwayhq.render.>=1.0.0,<2.0.0"
"slipwayhq.render."
"slipwayhq.."
".render."
```

```sh title="CLI"
--allow-registry-components-matching "slipwayhq.render."
--deny-registry-components-matching "slipwayhq.render.0.8.2"
```

For the JSON permission, `publisher`, `name` and `version` are specified separately and are all optional.
Versions can be ranges as with command line arguments.

```json title="JSON"
{ "permission": "registry_components", "publisher": "slipwayhq", "name": "render", "version": "1.0.0" },
{ "permission": "registry_components", "publisher": "slipwayhq" }
```


### HTTP Components

An HTTP Component is a component specified by an HTTP URL.

#### HTTP Components All

Allow or deny access to all HTTP Components.

```sh title="CLI"
--allow-http-components
--deny-http-components
```
```json title="JSON"
{ "permission": "http_components" }
```

#### HTTP Components Exact

Allow or deny access to specific HTTP Components.

```sh title="CLI"
--allow-http-components-exact "https://foo.com/my_component.tar"
--deny-http-components-exact "https://foo.com/my_component.tar"
```
```json title="JSON"
{ "permission": "http_components", "exact": "https://foo.com/my_component.tar" }
```

#### HTTP Components Prefix

Allow or deny access to HTTP Components with URLS starting with the given prefix.

```sh title="CLI"
--allow-http-components-prefix <ALLOW_HTTP_COMPONENTS_PREFIX>
--deny-http-components-prefix <DENY_HTTP_COMPONENTS_PREFIX>
```
```json title="JSON"
{ "permission": "http_components", "exact": "https://foo.com/my_components/" }
```

:::warning
As with [HTTP request prefixes](#http-prefix), these are simple string prefix checks.
A trailing slash should be used if required.
:::

### Local Components

A Local Component is a component specified by an file URL.

#### Local Components All

Allow or deny access to all local Components.

```sh title="CLI"
--allow-local-components
--deny-local-components
```
```json title="JSON"
{ "permission": "local_components" }
```

#### Local Components Exact

Allow or deny access to a specific local Component.
The string given here should exactly match the file URL requested
by the Component, as the permission is compared to the URL with a simple string comparison.

```sh title="CLI"
--allow-local-components-exact "file:./components/my_component.tar"
--deny-local-components-exact "file:./components/my_component.tar"
```
```json title="JSON"
{ "permission": "local_components", "exact": "file:./components/my_component.tar" }
```


