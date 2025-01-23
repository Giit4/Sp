const modelURL = "https://teachablemachine.withgoogle.com/models/7eGw3-o58/";
const serialPort = "COM17";

let classifier;
let serial;
let video;
let label = "";
let actionNum = 0;
let lastActionNum = null;
let lastSentTime = 0;
const sendInterval = 500;  // 500ms 마다 데이터 전송

window.onload = function() {
    console.log("ml5 version:", ml5.version);

    classifier = ml5.imageClassifier(modelURL + "model.json", function() {
        console.log("모델이 로드되었습니다!");
    });

    serial = new p5.SerialPort();
};

function setup() {
    createCanvas(320, 260);
    frameRate(30);

    serial.open(serialPort);

    // ✅ 기본 방식으로 웹캠 초기화 (최적화 전 코드로 복원)
    video = createCapture(VIDEO);
    video.size(320, 240);
    video.hide();

    console.log("비디오 초기화 완료!");
    classifyVideo();  // ✅ loadedmetadata 이벤트 없이 직접 실행
}

function draw() {
    background(0);

    if (video) {
        video.show();  // ✅ 웹캠 강제 활성화
        image(video, 0, 0);
    }

    fill(255);
    textSize(16);
    textAlign(CENTER);
    text(label, width / 2, height - 4);
}

function classifyVideo() {
    if (!video || !video.elt || video.elt.readyState < 2) {
        console.error("video가 아직 준비되지 않았습니다!");
        setTimeout(classifyVideo, 100);
        return;
    }

    classifier.classify(video, gotResult);
    setTimeout(classifyVideo, 300);
}

function gotResult(error, results) {
    if (error) {
        console.error(error);
        return;
    }

    label = String(results[0].label);

    switch (label) {
        case "orange": actionNum = 1; break;
        case "yellow": actionNum = 2; break;
        case "blue": actionNum = 3; break;
        case "pink": actionNum = 4; break;
        case "green": actionNum = 5; break;
        case "black": actionNum = 6; break;
        case "X": actionNum = 7; break;
        default: actionNum = 0; break;
    }

    let now = millis();
    if ((actionNum !== lastActionNum) && (now - lastSentTime > sendInterval)) {
        if (serial.isOpen()) {
            serial.write(actionNum + "\n");
            lastSentTime = now;
        }
        lastActionNum = actionNum;
    }
}