import { Pup } from "https://deno.land/x/pup/mod.ts"

const processConfiguration = {
  client: true,
  server: true,
  features: {
    client: {
      "id": "braidmail-start-client",
      "cmd": "deno task start-client",
      "autostart": true
    },
    server: {
      "id": "braidmail-start-server",
      "cmd": "deno task start-server",
      "autostart": true
    },
  }
}

const activeFeatures = Object.keys(processConfiguration)
  .filter(x => processConfiguration[x] === true)
  .map(x => processConfiguration.features[x])

console.log(activeFeatures)

const pup = await new Pup({
  "processes": activeFeatures
})

// Go!
pup.init()
