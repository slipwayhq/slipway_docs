---
sidebar_position: 50
---

# Hosting on Fly.io

Fly.io is an extremely straightforward way to host Slipway.

At time of writing they had a policy of not charing you anything if your monthly
bill comes to below $5[^pricing].

[^pricing]: It is possible this has changed since this article was updated, please do your own research.

They also have the option to automatically shut down idle servers, and start them when the next request
is received. The server start time is generally measured in milliseconds, and as Slipway is a native application
it's cold start time is also extremely fast, so this is an ideal option to use. With only a few devices you
might find your application is shut down most of the time, saving money. 

With those two things combined, there is a good chance you can host on Fly.io for free.

## Deploying for the First Time

Assuming you have a Slipway server already configured locally, deploying it to Fly.io is trivial.


### Install `flyctl`, the Fly.io CLI.

You can find instructions [here](https://fly.io/docs/flyctl).

### Sign up to Fly.io and log in.

You can sign up [through their website](https://fly.io/app/sign-up/) or [via the CLI](https://fly.io/docs/flyctl/auth-signup/),
and then [log in through the CLI](https://fly.io/docs/flyctl/auth-login/).

### Configure the Fly.io app

Run the `fly launch` command to configure the Fly.io app.

```sh
fly launch
```

See the documentation [here](https://fly.io/docs/flyctl/launch/).

You'll probably want to select a machine size based on your desired performance and [the cost](https://fly.io/docs/about/pricing/).
You can change the machine size at any time.

Keep in mind there is a good chance your machines will spend a lot of time shut down, so your costs will likely be much less than
what you see on the pricing page (but make sure you test this yourself).

For reference, I currently run Slipway on the following spec machine, priced (at time of writing) $3.89/month depending on the region:
```
size = 'shared-cpu-2x'
memory = '512mb'
```

:::tip
Make sure you have the following properties in your `fly.toml` (which `fly launch` will create for you) 
so that your machines start and stop automatically, saving you money:
```
auto_stop_machines = 'stop'
auto_start_machines = true
min_machines_running = 0
```

At time of writing if your bill is less than $5/month then Fly.io don't charge you anything.
:::

### Configure your secrets

If you require any environment variables, you can use the `fly secrets` command to configure these.

If you use 1Password quite a nice way to manage this is to create a `slipway.env` file containing references
to your secrets stored in 1Password, for example:

```title="slipway.env example"
GIVENERGY_API_TOKEN=op://slipway/givenergy.cloud/api-token
GIVENERGY_INVERTER_ID=op://slipway/givenergy.cloud/inverter-id
SLIPWAY_SECRET=op://slipway/slipway-self-host/slipway-secret
```

And then use the [1Password CLI](https://developer.1password.com/docs/cli) to inject secrets into Fly.io like so:

```sh
op inject -i slipway.env | fly secrets import
```

### Deploy your app

Once you're set up, you should simply be able to run the following command to deploy your app:
```sh
fly deploy
```

## Subsequent Deploys

If you make any changes to your configuration files, simply run `fly deploy` again to re-deploy.

If you make changes to your secrets, simply repeat the process of using `fly secrets` to re-deploy the secrets.

