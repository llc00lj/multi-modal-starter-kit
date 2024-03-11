"use client";

import { useEffect, useRef, useState } from "react";

// Remove all " and ' when passing to eleven labs.
function addslashes( str ) {
  return (str + '').replaceAll('"','').replaceAll("'","")
}

// Play audio from post response from 11 labs 
async function pAudio(response){
  let blob = await response.blob();
  let aurl = URL.createObjectURL(blob);
  var audio = new Audio(aurl);
  audio.play();
}

function isEmpty(val){
  return (val === undefined || val == null || val.length <= 0) ? true : false;
}

export default function Page({
  searchParams,
}: {
  searchParams: {
    name: string;
  };
}) {
  const videoUrl: string = `https://${process.env.NEXT_PUBLIC_BUCKET_NAME}.fly.storage.tigris.dev/${searchParams.name}`;
  const [narration, setNarration] = useState("");
  const [eachNar, setEachNar] = useState("");
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    if (narration != "") {
      let incre = 0;
      const timeoutId = setInterval(() => {
        setEachNar(narration);
        incre++;
        if (incre >= narration.length) {
          clearTimeout(timeoutId);
        }
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [narration]);

  const vidRef = useRef<HTMLVideoElement>(null);
  const canRef = useRef<HTMLCanvasElement>(null);

  const handlePlayVideo = () => {
    if (vidRef.current != null) {
      vidRef.current.play();
    }
  };

  async function describeVideo() {
    setShowSpinner(true);
    await fetch(`/api/describeVideo/`, {
      method: "POST",
      body: JSON.stringify({
        url: videoUrl,
        key: searchParams.name,
      }),
    }).then(async (response) => {
      setShowSpinner(false);
      console.log(response);
      const restext = await response.text();
      setNarration(restext);
    });
  }

  function captureFrame() {
    if (canRef.current && vidRef.current) {
      vidRef.current.pause();
      const context = canRef.current.getContext("2d")!;
      context.drawImage(vidRef.current, 0, 0, 640, 400);
      const dataURL = canRef.current.toDataURL("image/jpeg", 1);
      setShowSpinner(true);
      fetch(`/api/describe/`, {
        method: "POST",
        body: JSON.stringify({
          frame: dataURL,
        }),
      }).then(async (response) => {
        setShowSpinner(false);
        vidRef.current!.play();
        const restext = await response.text();
        setNarration(restext);


          if (!isEmpty(process.env.NEXT_PUBLIC_XI_API_KEY)) {
            // Narrate with 11 labs

            const escapestr = addslashes(restext);
            const xi_api_key = process.env.NEXT_PUBLIC_XI_API_KEY;
            const options = {
              method: 'POST',
              headers: {
                "Accept": "audio/mpeg",
                "Content-Type": "application/json",
                "xi-api-key": process.env.NEXT_PUBLIC_XI_API_KEY
              },
              body: '{"model_id":"eleven_turbo_v2","text":"' + escapestr + '"}',
            };

            fetch('https://api.elevenlabs.io/v1/text-to-speech/' + process.env.NEXT_PUBLIC_XI_VOICE_ID, options)
              .then(response => pAudio(response))
              .catch(err => console.error(err));
          } // end if Narrate with 11 labs

        });
    }
  }

  return (
    <>
      <div className="playerContainer">
        <h3>Playing video from Tigris:</h3>
        <p>{videoUrl}</p>

        <video
          ref={vidRef}
          crossOrigin=""
          width="640"
          height="400"
          controls
          preload="auto"
          data-setup="{}"
        >
          <source src={videoUrl} type="video/mp4" />
        </video>

        <div>
          <button
            className="button-53"
            onClick={handlePlayVideo}
            style={{ marginRight: 20 }}
          >
            Play
          </button>
          <button style={{ marginRight: 20 }} onClick={captureFrame}>
            Capture
          </button>
          <button onClick={describeVideo}>Describe Video</button>
        </div>

        <h3>Narration using GPT 4 vision:</h3>
        <p>{eachNar}</p>

        {showSpinner && (
          <div className="lds-ellipsis">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        )}

        <canvas
          ref={canRef}
          width="640"
          height="480"
          style={{ display: "none" }}
        ></canvas>
      </div>
    </>
  );
}
