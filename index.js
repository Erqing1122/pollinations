import { runModel as runModelUncached } from '@pollinations/ipfs/ipfsWebClient.js';
import http from 'http';

import memoize from 'lodash.memoize';
import { parse } from 'url';
import urldecode from 'urldecode';
import { cache } from './cache.js';

import jimp from 'jimp';
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
  let seed = 13; //seedOverride ? parseInt(seedOverride) : 13;
  while (!url) {
    try {
    
      const output = await runModel( {
        prompts: prompt,
        num_frames_per_prompt: 1,
        diffusion_steps: 20,
        seed,
        // width: 320,
        // height: 256
        // seed: seed || 0
      }, "614871946825.dkr.ecr.us-east-1.amazonaws.com/pollinations/stable-diffusion-private",false, 
        {
          priority: seedOverride ? 5 : -1
        })

      url = output?.output["00003.png"];
    } catch(e) {
      console.error(e)
      console.log(e)
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

  // add legend
  const legendText = "pollinations.ai";

  // use image.print of jimp to add text to the bottom of the image

  const imageWithLegend = await jimp.read(buffer);
  const font = await jimp.loadFont(jimp.FONT_SANS_32_BLACK);

  const textWidth = jimp.measureText(font, legendText);
  const textHeight = jimp.measureTextHeight(font, legendText, textWidth);

  const imageWidth = imageWithLegend.getWidth();
  const imageHeight = imageWithLegend.getHeight();

  const x = imageWidth - textWidth - 10;
  const y = imageHeight - 36;

  if (!seedOverride)
    imageWithLegend.print(font, x, y, legendText);
  
  const bufferWithLegend = await imageWithLegend.getBufferAsync(jimp.MIME_JPEG);

  res.write(bufferWithLegend);

  // res.write(buffer);

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


// call rest api like this

// const body = {
//   "image": "replicate:pollinations/lemonade-preset",
//   "input": {
//       "image": await toBase64(image),
//       "styles": styles,
//       "num_images_per_style": num_images_per_style,
//       "strength": strength,
//       "gender": gender,
//       "ethnicity": ethnicity
//   }
// }

// const response = await fetch('https://rest.pollinations.ai/pollen', {
//   method: 'POST',
//   body: JSON.stringify(body),
//   headers: {
//       "Authorization": `Bearer ${document.querySelector('#token').value}`,
//       "Content-Type": "application/json"
//   }
// });

const callPimpedDiffusion = async (prompt, token) => {

    const body = {
      image: "614871946825.dkr.ecr.us-east-1.amazonaws.com/pollinations/pimped-diffusion",
      input: {
        prompt
      }
    }

  const response = await fetch('https://rest.pollinations.ai/pollen', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
    }
  });

  console.log(await response.json())
  
}

// callPimpedDiffusion("apple", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJwb2xsaW5hdGlvbnMtZ2VuZXJpYy1mcm9udGVuZCIsImV4cCI6MTY4NTI2NTQ1Nn0.Zzf45fZcmLt9WK74si9KO1TexdzZ5qJi1ED2pHvMqBo")