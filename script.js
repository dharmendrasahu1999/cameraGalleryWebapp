let video=document.querySelector("video");
let recordBtnCont=document.querySelector(".record-btn-cont");
let recordBtn=document.querySelector(".record-btn");
let captureBtnCont=document.querySelector(".capture-btn-cont");
let captureBtn=document.querySelector(".capture-btn");
let recorder;
let recordFlag=false;
let chunks=[];//media data in chunks
let transparentColor="transparent";

let constraints={
    video:true,
    audio:true
}

//navigator--> global,browser info

window.navigator.mediaDevices.getUserMedia(constraints)
.then((stream)=>{
    video.srcObject=stream;
    recorder=new MediaRecorder(stream);
    recorder.addEventListener("start",(e)=>{
        chunks=[];
    })

    recorder.addEventListener("dataavailable",(e)=>{
        chunks.push(e.data);
    })

    recorder.addEventListener("stop",(e)=>{
        //conversion of media chunks to video
        let blob=new Blob(chunks,{type:"video/mp4"});

        if(db){
            let videoId=shortid();
            let dbTransaction = db.transaction("video","readwrite")
            let videoStore=dbTransaction.objectStore("video");
            let videoEntry={
                id:`vid-${videoId}`,
                blobData:blob
            }
            videoStore.add(videoEntry);
        }
        // let videoURL=URL.createObjectURL(blob);

        // let a=document.createElement("a");
        // a.href=videoURL;
        // a.download="stream.mp4";
        // a.click();
    })
})

recordBtnCont.addEventListener("click",(e)=>{
    if(!recorder) return;

    recordFlag=!recordFlag;

    if(recordFlag){
        //satrt
        recorder.start();
        recordBtn.classList.add("scale-record");
        startTimer();
    }else{
        //stop
        recorder.stop();
        recordBtn.classList.remove("scale-record");
        stopTimer();

    }

})

captureBtnCont.addEventListener("click",(e)=>{
    captureBtn.classList.add("scale-capture");
    let canvas=document.createElement("canvas");
    canvas.width=video.videoWidth;
    canvas.height=video.videoHeight;
    let tool=canvas.getContext("2d");
    tool.drawImage(video, 0, 0, canvas.width, canvas.height);

    //filtering color
    tool.fillStyle=transparentColor;
    tool.fillRect(0, 0, canvas.width, canvas.height);


    let imageURL=canvas.toDataURL();
    if (db) {
        let imageID = shortid();
        let dbTransaction = db.transaction("image", "readwrite");
        let imageStore = dbTransaction.objectStore("image");
        let imageEntry = {
            id: `img-${imageID}`,
            url: imageURL
        }
        imageStore.add(imageEntry);
    }
    // let a = document.createElement("a");
    // a.href=imageURL;
    // a.download="image.jpg";
    // a.click();

    setTimeout(()=>{
        captureBtn.classList.remove("scale-capture");
    },500);
})

let timerId;
let counter=0;//represents total seconds
let timer=document.querySelector(".timer");
function startTimer(){
    timer.style.display="block";
    function displayTimer(){
        let totalSeconds=counter;
        let hours=Number.parseInt(totalSeconds/3600);
        totalSeconds=totalSeconds%3600;//remaining time
        let minutes= Number.parseInt(totalSeconds/60);
        totalSeconds=totalSeconds%60;

        let seconds=totalSeconds;

        hours = (hours < 10) ? `0${hours}` : hours;
        minutes = (minutes < 10) ? `0${minutes}` : minutes;
        seconds = (seconds < 10) ? `0${seconds}` : seconds;

        timer.innerText=`${hours}:${minutes}:${seconds}`;
        counter++;
    }
    timerId=setInterval(displayTimer,1000);
}

function stopTimer(){
    clearInterval(timerId);
    timer.innerText="00:00:00";
    timer.style.display="none";
}


//filtering logic
let filterLayer=document.querySelector(".filter-layer");
let allFilters=document.querySelectorAll(".filter");

allFilters.forEach((filterElem)=>{
    filterElem.addEventListener("click",(e)=>{
        //get
        transparentColor=getComputedStyle(filterElem).getPropertyValue("background-color");
        filterLayer.style.backgroundColor=transparentColor;
    })
})
