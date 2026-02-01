function goToEggPuff() {
  window.location.href = "https://eggpuff.in";
}

const page = window.location.pathname;

const mediaMap = {
  "mawa": [
    { type: "video", src: "media/mawa-video.mp4" },
    { type: "image", src: "media/mawa-pic.jpg" }
  ],
  "career": [
    { type: "video", src: "media/career-video.mp4" },
    { type: "audio", src: "media/career-audio.mp3" }
  ],
  "escape": [
    { type: "video", src: "media/escape-video.mp4" },
    { type: "image", src: "media/escape-pic.png" }
  ]
};

let key = "mawa";
if (page.includes("career")) key = "career";
if (page.includes("escape")) key = "escape";

const container = document.getElementById("media-container");
const list = mediaMap[key];

if (container && list) {
  const chosen = list[Math.floor(Math.random() * list.length)];
  let el;

  if (chosen.type === "video") {
    el = document.createElement("video");
    el.src = chosen.src;
    el.autoplay = true;
    el.muted = true;
    el.loop = true;
    el.playsInline = true;
    el.className = "media";
  }

  if (chosen.type === "audio") {
    el = document.createElement("audio");
    el.src = chosen.src;
    el.controls = true;
    el.className = "media";
  }

  if (chosen.type === "image") {
    el = document.createElement("img");
    el.src = chosen.src;
    el.className = "media";
  }

  container.appendChild(el);
}
