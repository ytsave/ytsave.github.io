const videoUrl = document.querySelector(".wrapper input"),
  thumbName = document.querySelector(".thumb-name input"),
  thumbResolution = document.querySelector(".select-menu select"),
  grabBtn = document.querySelector(".grab-btn"),
  downloadBtn = document.querySelector(".download-btn"),
  preview = document.querySelector(".preview-wrapper"),
  formEl = document.querySelector("form"),
  thumbAnchor = document.querySelector('.thumb-img a');
const thumbImg = document.getElementById("thumb-img");
let videoId, thumbnailUrl;
let thumbnailBaseUrl = "https://img.youtube.com/vi/";
const corsProxy = "https://mweb-proxy-semihofc.netlify.app/?destination=";
const notyf = new Notyf({ duration: 5_000, position: { y: 'bottom' }, dismissible: true });
const $gallery = new SimpleLightbox(thumbAnchor, {});

tippy('#thumbName', {
  content: "Secara default nama file akan sesuai format '{ID-VIDEO}_{NAMA-RESOLUSI} - Hataken Project' jika kolom ini tidak diisi.",
  placement: 'auto',
  arrow: true
});


videoUrl.addEventListener("focus", () => {
  if (videoUrl.value) {
    videoUrl.select();
  }
})
videoUrl.addEventListener("click", () => {
  if (videoUrl.value) {
    videoUrl.select();
  }
})
/*videoUrl.addEventListener("touchstart", () => {
  if (videoUrl.value) {
    videoUrl.select();
  }
})*/

videoUrl.addEventListener("keyup", () => {
  if (videoUrl.checkValidity()) grabBtn.disabled = false;
  if (!videoUrl.value) {
    preview.classList.remove("show");
    grabBtn.disabled = true;
  }
})

grabBtn.addEventListener("click", e => {
  e.preventDefault();

  grabThumb();
})

thumbResolution.addEventListener('change', () => {
  grabThumb(false);
})

downloadBtn.addEventListener("click", e => {
  e.preventDefault();

  downloadBtn.innerText = "Downloading...";
  downloadBtn.disabled = true;
  downloadBtn.classList.add('disabled');

  /*const headers = headers = {
    'Origin': 'https://img.youtube.com',
    'Content-Type': 'image/jpg',
  }*/
  /*headers.append('Content-Type', 'image/jpg');
  headers.set('Accept', 'image/jpg');
  headers.set('Origin', 'https://img.youtube.com');*/

  /*const thumbInit = {
    method: 'GET',
    headers: {
    'Origin': 'https://img.youtube.com',
    'Content-Type': 'image/jpg',
      
    },
  }*/

  let cors = corsProxy + thumbnailUrl;

  fetch(cors)
    .then((response) => response.blob())
    .then((data) => {
      const objectURL = URL.createObjectURL(data),
        link = document.createElement("a");
      link.href = objectURL;

      if (thumbName.value) {
        link.download = `${thumbName.value}_${thumbResolution.value} - Hataken Project`;
      } else {
        link.download = `${videoId}_${thumbResolution.value} - Hataken Project`;
      }

      document.body.appendChild(link);
      link.click();
      URL.revokeObjectURL(objectURL);
      link.remove();
      downloadBtn.innerText = "Download Thumbnail";
      downloadBtn.disabled = false;
      downloadBtn.classList.remove('disabled');
      notyf.success('Berhasil mengunduh thumbnail');
    }).catch(e => {
      console.log(e);
      downloadBtn.innerText = "Download Thumbnail";
      downloadBtn.disabled = false;
      downloadBtn.classList.remove('disabled');
      notyf.error('Gagal mengunduh thumbnail, laporin aja cuy..');
    });

})

formEl.addEventListener("submit", (e) => {
  e.preventDefault();
});

function base64ToBlob(base64String, contentType = 'application/octet-stream') {
  const byteCharacters = atob(base64String);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
}


function imgError() {
  notyf.error('Gagal mengambil thumbnail! Coba cek URL yang diinput valid atau tidak.');
  // alert("Gagal mengambil thumbnail! Coba cek URL yang diinput valid atau tidak.");
}

function grabThumb(isError = true) {
  if (videoUrl.value.includes("youtu.be")) {
    // Handle youtu.be URLs
    videoId = videoUrl.value.split("/")[3].split('?')[0];
  } else if (videoUrl.value.includes("music.youtube.com")) {
    // Handle music.youtube.com URLs
    const params = new URLSearchParams(videoUrl.value.split('?')[1]);
    videoId = params.get('v');
  } else if (videoUrl.value.includes("youtube.com")) {
    // Handle youtube.com URLs
    const urlParams = new URLSearchParams(videoUrl.value.split('?')[1]);
    videoId = urlParams.get('v') || videoUrl.value.split(/[/?]/)[4];
  } else {
    // Handle other cases or display an error
    if (isError) imgError();
    return;
  }

  console.log("Video ID:", videoId);
  if (videoId) {
    thumbnailUrl = thumbnailBaseUrl + videoId + "/" + thumbResolution.value + ".jpg";
    thumbAnchor.href = thumbnailUrl;
    thumbImg.src = thumbnailUrl;
    grabBtn.innerText = "Grabbing Thumbnail...";
    grabBtn.disabled = true;
    grabBtn.classList.add('disabled');
    thumbImg.addEventListener("load", () => {
      grabBtn.innerText = "Grab";
      grabBtn.disabled = false;
      grabBtn.classList.remove('disabled');
      preview.classList.add("show");
      tippy('#previewHelp', {
        content: "Jika gambar thumbnail menampilkan thumbnail placeholder youtube (yang berwarna abu-abu), maka coba ganti resolusinya satu-persatu.",
        placement: 'auto',
        arrow: true
      });
    })
  } else {
    imgError();
  }
}
