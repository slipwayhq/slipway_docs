---
sidebar_position: 30
---

# Secrets and Hashed API Keys

One of the primary goals of Slipway was to require as little infrastructure complexity as possible when self hosting.

Our aim was that our server would simply consist of a set of configuration files, which 
could be version controlled using Git and deployed anywhere as a simple container, 
or with just the Slipway binary.

However sometimes we need to access _secrets_, and those raw secrets can't live in configuration files,
and certainly can't live in source control.

You can split these kinds of secrets into two categories:
- Secrets that you only need to verify.
- Secrets where you need to know the values.

We'll talk about each of these.

## Secrets that you only need to verify

Here, in the context of Slipway, we're talking about the API keys.
Slipway doesn't need to know the API keys, it just needs to be able to verify the key is correct when
one is supplied.

In this kind of scenario it is typical to store the hash of the key, rather than the key itself,
and this is exactly what Slipway does.

There are two requirements for this to be secure:
1. The API keys should be sufficiently long, random and complex.
2. The hashing algorithm should be sufficiently strong.

If both these conditions are met then then reversing the hash algorithmically is impossible and performing 
a brute-force search to discover the original key from the hash is 
[computationally infeasible](https://specopssoft.com/blog/sha256-hashing-password-cracking/).

In our case we use randomly generated 52 character alphanumeric API keys, which more than satisfies the first point,
and SHA256 for hashing, which satisfies the second point.

This allows us to safely store the hashed API keys directly in the `slipway serve` configuration files.

:::warning
This does mean that __if you generate your own API keys you must ensure they are sufficiently long and random__.

Using an API key of `hunter2` is a very bad idea.

This is why the `slipway serve . add-api-key` command does not have the option of passing in an API
key, and always generates a secure key for you.
:::

:::info
When storing the hash of a password you typically also want to use a [salt](https://en.wikipedia.org/wiki/Salt_%28cryptography%29).
The salt protects against rainbow table attacks for short/simple passwords, and means that even when
multiple users happen to select the same password the stored hashes appear different.

For long, randomly generated API keys neither of these points are a concern.
:::

## Secrets where you need to know the values

The main way of handling these kinds of secrets in Slipway is with environment variables, although using alternatives 
(for example using a key vault or secrets manager) is also possible.

If you use TRMNL devices with Slipway, or need to request Rigs in the [`html` format](/docs/basics/serving-rigs#format),
it is [recommended](/docs/guides/the-slipway-secret-env) to specify an environment variable called `SLIPWAY_SECRET`.

In addition to `SLIPWAY_SECRET` you can create your own environment variables and give individual Components
[permission to read only the environment variables they require](/docs/basics/permissions#environment-variables)
to perform the actions they need to perform.

:::info
Personally I manage environment variables this by storing the sensitive values in 1Password, and then using a
`slipway.env` file to configure the environment variables using references to the items in 1Password

For example:
```env title="slipway.env"
GIVENERGY_API_TOKEN=op://slipway/givenergy.cloud/api-token
GIVENERGY_INVERTER_ID=op://slipway/givenergy.cloud/inverter-id
SLIPWAY_SECRET=op://slipway/slipway-self-host/slipway-secret
```

I then use the 1Password CLI to, for example, start VSCode with the environment variables populated:
```sh
op run --env-file slipway.env -- code .
```

Or to deploy the secrets to Fly.io:
```sh
op inject -i slipway.env | fly secrets import
```

The advantage of this is that my secrets are all stored securely in 1Password, and that I can keep
the `slipway.env` file in my Git repository along with the rest of my server configuration.
:::



