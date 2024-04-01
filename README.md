## Multi Modal Starter Kit 🤖📽️

A multi modal starter kit that have AI narrate a video or scene of your choice. Includes examples of how to do video processing, frames extraction, and sending frames to AI models optimally. 

Have questions? Join [AI Stack devs](https://discord.gg/TsWCNVvRP5). 

## Stack
- 💻 Video and Image hosting: [Tigris](https://www.tigrisdata.com/)
- 🦙 Inference: [Ollama](https://github.com/jmorganca/ollama), with options to use [Replicate](https://replicate.com/) or OpenAI
- 💾 Caching: [Upstash](https://upstash.com/)
- 🤔 AI response pub/sub: [Upstash](https://upstash.com/)
- 📢 Video narration: [ElevenLabs](https://elevenlabs.io/)
- 🖼️ App logic: [Next.js](https://nextjs.org/)
- 🖌️ UI: [Vercel v0](https://v0.dev/) 

## Overview
- 🚀 [Quickstart](#quickstart)
- 💻 [Useful Commands](#useful-commands)

## Quickstart

### Step 1: Set up Tigris

1. Create an .env file
```
cd multi-modal-starter-kit
cp .env.example .env
```

2. Set up Tigris
- Make sure you have a fly.io account and have fly CLI installed on your computer
- `cd multi-modal-starter-kit` and run `fly storage create`
- You should get a list of credentials like below:
  <img width="859" alt="Screenshot 2024-03-24 at 5 40 36 PM" src="https://github.com/tigrisdata-community/multi-modal-starter-kit/assets/3489963/a400d444-8d5f-445e-a48a-1749f7595c47">
- Copy paste these values to your .env under "Tigris"

3. Set Tigris bucket cors policy and bucket access policy

- `fly storage update YOUR_BUCKET_NAME --public`
- Run the following command under /webapp directory (make sure you have aws CLI installed and have run `aws configure`)
- `aws s3api put-bucket-cors --bucket BUCKET_NAME --cors-configuration file://cors.json --endpoint-url https://fly.storage.tigris.dev/`

### Step 2: Create a test video
- Run `aws configure` and fill in access id / secret.
- `aws s3 cp PATH_TO_VIDEO_FILE s3://BUCKET_NAME --endpoint-url https://fly.storage.tigris.dev`

### Step 3: Set up ElevenLabs
- Go to https://elevenlabs.io/, log in, and click on your profile picture on lower left. Select "Profile + API key". Copy the API key and save it as `XI_API_KEY` in the .env file
- Select a 11labs voice by clicking on "Voices" on the left side nav bar and navigate to "VoiceLab". Copy the voice ID and save it as `XI_VOICE_ID` in .env

### Step 4: Set up Upstash
When narrating a very long video, Upstash Redis is used for pub/sub and notifies the client when new snippets of reply come back. Upstash is also used for the critical task of caching video/images so the subsequent requests don't take long.

- Go to https://console.upstash.com/, select "Create Database" with the following settings
  <img width="518" alt="Screenshot 2024-03-24 at 5 46 30 PM" src="https://github.com/tigrisdata-community/multi-modal-starter-kit/assets/3489963/182d0d9f-51dc-4bc2-aebc-31acaaab9463">
- Once created, under 'Node' - 'io-redis' tab, copy the whole string starting with "rediss://" and set `UPSTASH_REDIS_URL` value as this string in .env
  <img width="937" alt="Screenshot 2024-03-24 at 5 49 50 PM" src="https://github.com/tigrisdata-community/multi-modal-starter-kit/assets/3489963/126ebb25-0150-4efb-b9af-2edeed05e3c3">
- On the same page, scroll down to the "Rest API" section and copy paste everything under ".env" tab to your .env file
  <img width="954" alt="Screenshot 2024-03-24 at 5 52 25 PM" src="https://github.com/tigrisdata-community/multi-modal-starter-kit/assets/3489963/2d506eb2-f019-4f0d-8b51-d1efa1d95bc5">

### Step 5: Set up Ollama / Llava

- By Default the app uses Ollama / llava for vision. If you want to use OpenAI Chatgpt4v instead, you can set `USE_OLLAMA=false` and fill in `OPENAI_API_KEY` in .env
- [Install Ollama](https://ollama.com/download)
- `ollama pull llava`
- (optional) Watch requests coming into Ollama by running this in a new terminal tab `tail -f ~/.ollama/logs/server.log`

### Step 6: Run App

- cd `webapp`
- `npm install`
- `npm run dev`

## Useful Commands
Tigris is 100% aws cli compatible. Here are some frequently used commands during active development:

### Check Tigris Dashboard 
```
fly storage dashboard BUCKET_NAME
```

### Periodic cleanup
Currently temporary files for the snapshots that get passed to the model and the elevenlabs voice files are stored in the bucket
and are not cleaned up. To clean these up, you can run the following from the CLI:

`aws s3 rm s3://BUCKET_NAME/ --endpoint-url https://fly.storage.tigris.dev --recursive --exclude "*.mp4"`

### Upload videos 
```
aws s3 cp PATH_TO_YOUR_VIDEO s3://BUCKET_NAME --endpoint-url https://fly.storage.tigris.dev
```
