let tab;
let recorder;

async function startRecording() {
  try {
    tab = await chrome.tabs.getSelected(null);

    const audioStream = await new Promise(resolve => {
      chrome.tabCapture.capture({
        audio: true
      }, resolve);
    });

    const videoStream = await new Promise(resolve => {
      chrome.tabCapture.capture({
        video: true,
        audio: false
      }, resolve);
    });

    const stream = new MediaStream([...audioStream.getTracks(), ...videoStream.getTracks()]);

    recorder = new RecordRTC(stream, {
      type: "video"
    });

    recorder.startRecording();
  } catch (err) {
    console.error(err);
  }
}

async function stopRecording() {
  try {
    recorder.stopRecording(() => {
      const blob = recorder.getBlob();
      const url = URL.createObjectURL(blob);

      chrome.downloads.download({
        url: url,
        filename: "meet-recording.webm"
      });
    });
  } catch (err) {
    console.error(err);
  }
}

document.querySelector("#record").addEventListener("click", startRecording);
document.querySelector("#stop").addEventListener("click", stopRecording);
