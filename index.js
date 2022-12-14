import { runModel as runModelUncached } from '@pollinations/ipfs/ipfsWebClient.js';
import http from 'http';

import memoize from 'lodash.memoize';
import { parse } from 'url';
import urldecode from 'urldecode';
import { cache } from './cache.js';

import fetch from 'node-fetch';

const runModel = memoize(cache(runModelUncached), params => JSON.stringify(params))

const requestListener = async function (req, res) {

  const { pathname } = parse(req.url, true);

  console.log("path: ", pathname);

  if (!pathname.startsWith("/prompt")) {
    res.writeHead(404);
    res.end('404: Not Found');
    return
  }
  res.writeHead(200, { 'Content-Type': 'image/jpeg' });
  // const { showImage, finish } = gifCreator(res);

  // await showImage("https://i.imgur.com/lTAeMmN.jpg");

  const promptAndSeed = pathname.split("/prompt/")[1];
  
  if (!promptAndSeed) {
    res.writeHead(404);
    res.end('404: Not Found');
    return
  }
  const [promptRaw, seedOverride] = promptAndSeed.split("/");

  const prompt = urldecode(promptRaw).replaceAll("_", " ");

  let url = null;
  let seed = seedOverride ? parseInt(seedOverride) : 13;
  while (!url) {
    try {
  
    const output = await runModel( {
      prompts: prompt,
      num_frames_per_prompt: 1,
      diffusion_steps: 10,
      seed,
      width: 320,
      height: 256
      // seed: seed || 0
    }, "614871946825.dkr.ecr.us-east-1.amazonaws.com/pollinations/stable-diffusion-private",false, {priority: 2})

    url = output?.output["00003.png"];
  } catch(e) {
    console.error(e)
    console.log("retrying...")
  }
    seed++;
  }
  
  console.log("Showing image: ", url);
  // await showImage(url);

  // finish()


  // fetch the image and return it to the response
  const image = await fetch(url);
  const buffer = await image.buffer();
  res.write(buffer);

  console.log("finishing")
  res.end();

}

// dummy handler that  redirects all requests to the static image: https://i.imgur.com/emiRJ04.gif
const dummyListener = async function (req, res) {
  // return a 302 redirect to the static image
  res.writeHead(302, {
    'Location': 'https://i.imgur.com/DgRPBiJ.gif'
  });
  res.end();
}
  

const server = http.createServer(requestListener);
server.listen(8080);


