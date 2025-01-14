let currentSong =new Audio;
let songs
let currFolder
function formatTime(seconds) {
    // Ensure seconds are whole numbers
    seconds = Math.floor(seconds);

    // Calculate minutes and remaining seconds
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    // Format minutes and seconds to always have two digits
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = remainingSeconds.toString().padStart(2, '0');

    // Return the formatted time
    return `${formattedMinutes}:${formattedSeconds}`;
}


async function getSongs(folder){
    currFolder=folder
    let a= await fetch(`/${folder}`);
    let result= await a.text()

    let div=document.createElement("div")
    div.innerHTML=result
    let as=div.getElementsByTagName("a")
    songs=[]
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.endsWith(".mp3"))
            songs.push(element.href.split(`/${folder}/`)[1])

        
    }

    let songUl = document.querySelector(".song-list").getElementsByTagName("ul")[0];
    let songListHTML = "";
    for (const song of songs) {
        const songName = song.replaceAll("%20", " ");
        songListHTML += `
            <li class="pointer">
                <div class="song-card flex">
                    <img class="invert" src="assets/images/music.svg">
                    <div class="songName">${songName}</div>
                    <img  class="invert " src="assets/images/play.svg">
                </div>
            </li>`;
    }
    songUl.innerHTML = songListHTML; // Update DOM once

    // Add event listeners to each song
    Array.from(songUl.getElementsByTagName("li")).forEach((e) => {
        e.addEventListener("click", (event) => {
            const songCard = e.querySelector(".song-card");
            if (songCard) {
                const songName = songCard.querySelector(".songName").innerHTML.trim();
                console.log(songName);
                playSong(songName);
            } else {
                console.error("Song card missing in clicked element.");
            }
        });
    });
     
}
const playSong=(track,pause=false)=>{
    // let audio=new Audio('/songs/' + track)
    currentSong.src=`/${currFolder}/` +track
    if(!pause){
    currentSong.play()
    play.src="assets/images/pause.svg"
    }
    document.querySelector(".player-left").innerHTML=decodeURI(track)
    document.querySelector(".curr-time").innerHTML="00:00"
    document.querySelector(".duration").innerHTML="00:00"
}

async function displayAlbums(){
    let a= await fetch(`/songs/`);
    let result= await a.text()
    let cardContainer=document.querySelector(".card-holder")
    let div=document.createElement("div")
    div.innerHTML=result
    let as=div.getElementsByTagName("a")
    let array=Array.from(as)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        
        if(e.href.includes("/songs/")){
            let folder=e.href.split("/songs/")[1]
            console.log(folder)
            // get metadata of the folder
            let a= await fetch(`/songs/${folder}/info.json`);
            let result= await a.json()
            cardContainer.innerHTML+= `<div data-folder="${folder}" class="card pointer">
                    <img src="assets/images/cover.jpg" alt="img">
                    <h2>${result.title}</h2>
                    <p>${result.description}</p>
                </div>`
        }
    }
    Array.from(document.querySelectorAll(".card")).forEach(e=>{
        e.addEventListener("click", async item=>{
            console.log(e)
            songs= await getSongs(`songs/${item.currentTarget.dataset.folder}`)
        })
    })
    
}










async function main() {

    // Fetch songs
    await getSongs("songs/new");
    
    playSong(songs[0],true)

    displayAlbums()
    
    // Build the list of songs using a single DOM update
    

    play.addEventListener("click",()=>{
        if(currentSong.paused){
            currentSong.play()
            play.src="assets/images/pause.svg"
        }
        else{
            currentSong.pause()
            play.src="assets/images/play.svg"
        }
    })

    currentSong.addEventListener("timeupdate",()=>{
        document.querySelector(".curr-time").innerHTML=`${formatTime(currentSong.currentTime)} `
        document.querySelector(".duration").innerHTML=`${formatTime(currentSong.duration)} `


        document.querySelector(".circle").style.left = (currentSong.currentTime/currentSong.duration)*100 + "%";
    

    })

    document.querySelector(".seekbar").addEventListener("click",e=>{
        let percent=(e.offsetX / e.target.getBoundingClientRect().width)*100
        document.querySelector(".circle").style.left = percent+"%";
        currentSong.currentTime=(currentSong.duration*percent)/100 ;
    })

    document.querySelector(".hamburger").addEventListener("click",()=>{
        document.querySelector(".library").style.left="-10px";
    })
    document.querySelector(".close").addEventListener("click",()=>{
        document.querySelector(".library").style.left="-100%";
    })

    
    prev.addEventListener("click",()=>{
        let index=songs.indexOf(currentSong.src.split(`/${currFolder}/`)[1])
        if(index<=0){

            playSong(songs[0])
        }
        else{
            playSong(songs[index-1])
        }
    })
    next.addEventListener("click",()=>{
        let index=songs.indexOf(currentSong.src.split(`/${currFolder}/`)[1])
        if(index+1>=songs.length){

            playSong(songs[0])
        }
        else{
            playSong(songs[index+1])
        }
    })

    document.querySelector(".range").addEventListener("change",(e)=>{
        console.log(e.target.value)
        currentSong.volume=e.target.value/100
    })

    
    



}

main()
