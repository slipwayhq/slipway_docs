---
sidebar_position: 50
---

# Hosting on Fly.io

Fly.io is an extremely straightforward way to host Slipway, and can often be done for free.

At time of writing Fly had a policy of not charging you anything if your monthly
bill comes to below $5[^pricing], which (especially if you use their option to shut down idle servers) 
it quite likely will.
For my personal Slipway server it costs less than $1/month, which means they don't charge me anything.

[^pricing]: It is possible this has changed since this article was written, please do your own research.

## Deploying for the First Time

Assuming you have a Slipway server already configured locally, deploying it to Fly.io is trivial.

#### 1. Install the Fly.io CLI

You can find instructions [here](hhttps://fly.io/docs/flyctl/install/).

#### 2. Authenticate

If you don't have an account you can sign up [through their website](https://fly.io/app/sign-up/) or [via the CLI](https://fly.io/docs/flyctl/auth-signup/):

```sh
fly auth signup
```

Then [log in through the CLI](https://fly.io/docs/flyctl/auth-login/):

```sh
fly auth login
```

#### 3. Configure the Fly.io app

Run [the `fly launch` command](https://fly.io/docs/flyctl/launch/) from your Slipway server root to quickly configure a new Fly.io app.

```sh
fly launch
```

:::info[Machine Sizes]
You'll probably want to select a machine size based on your desired performance and [the cost](https://fly.io/docs/about/pricing/).
You can change the machine size at any time.

Keep in mind there is a good chance your machines will spend a lot of time shut down, so your costs will likely be much less than
what you see on the pricing page (but make sure you test this yourself).

For reference, I currently run Slipway on the following spec machine, priced (at time of writing) $3.89/month depending on the region:
```
size = 'shared-cpu-2x'
memory = '512mb'
```
:::

:::tip
The `fly launch` command will create a `fly.toml` configuration file for you.
Make sure you have the following properties in your `fly.toml` 
so that your machines start and stop automatically, saving you money:
```
auto_stop_machines = 'stop'
auto_start_machines = true
min_machines_running = 0
```
:::

#### 4. Configure your secrets

If you require any environment variables, which Slipway doesn't by default,
you can use [the `fly secrets` command](https://fly.io/docs/flyctl/secrets/) to deploy these.

:::tip
If you use 1Password then quite a nice way to manage this is to create a `slipway.env` file containing references
to your secrets stored in 1Password, for example:

```title="slipway.env example"
GIVENERGY_API_TOKEN=op://slipway/givenergy-cloud/api-token
GIVENERGY_INVERTER_ID=op://slipway/givenergy-cloud/inverter-id
SLIPWAY_SECRET=op://slipway/slipway-self-host/slipway-secret
```

And then use the [1Password CLI](https://developer.1password.com/docs/cli) to inject secrets into Fly.io like so:

```sh
op inject -i slipway.env | fly secrets import
fly secrets deploy
```
:::

#### 5. Deploy your app

Once you're set up, you should simply be able to run the following command to deploy your app:
```sh
fly deploy
```

## Subsequent Deploys

If you make any changes to your configuration files, simply run `fly deploy` again to re-deploy.

If you make changes to your secrets, simply repeat the process of using `fly secrets` to re-deploy the secrets.

