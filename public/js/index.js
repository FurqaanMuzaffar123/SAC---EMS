const typedText = $(".typed").text();

const decoy = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890@#$%!";
const extra = 4;
const animationSound = new Audio("/audio/animation.mp3");
const continueSound = new Audio("/audio/next.mp3")
const clones = $(".clone");
const slices = $(".slice");

clones.html($(".container").prop("outerHTML"));

let randomChar = () => decoy[Math.floor(Math.random() * decoy.length)];
let display = "";
let phase = 1;
let p2Counter = 0;
let tick = 0;

$(".typed").text("");

// 0
// -8
// 6
// -5
// 3
// -2
// 1
// 0

function glitch() {

    const container = $(".container");
    const rect = container[0].getBoundingClientRect();

    const strips = 3; // number of slices

    for (let i = 0; i < strips; i++) {

        const top = Math.random() * (rect.height - 25);
        const height = 10 + Math.random() * 50;
        const offset = (Math.random() - 0.5) * 100;

        const slice = $("<div class='glitch-strip'></div>");

        slice.css({
            left: rect.left,
            top: rect.top + top,
            width: rect.width,
            height: `${height}px`
        });

        const clone = container.clone();

        clone.css({
            margin: 0,
            transform: `translate(${offset}px, -${top}px)`
        });

        slice.append(clone);

        $("body").append(slice);

        setTimeout(() => slice.remove(), 60);
    }
}



$(".boot-screen").on("click", () => {
  $(".boot-screen").hide();
  $(".flash").css("opacity", "1");
  setTimeout(() => {
    $(".flash").css("opacity", "0");
  }, 10);
  let count = 0;

const shakeInterval = setInterval(() => {

    $(".container").css({
        filter: "drop-shadow(-5px 0 red) drop-shadow(5px 0 cyan)",
        transform: `
            translate(
                ${(Math.random() - 0.5) * 60}px,
                ${(Math.random() - 0.5) * 20}px
            )
            rotate(${(Math.random() - 0.5) * 6}deg)
        `
    });

    count++;

    if (count > 15) {
        clearInterval(shakeInterval);

        $(".container").css({
            transform: "",
            filter: "none"
        });
    }

}, 15);
  $(".container").show();

  animationSound.currentTime = 0;
  animationSound.loop = true;
  animationSound.play();
  let intervalcounter = 0
  const interval = setInterval(() => {
    if (intervalcounter%2==0){
      glitch()
    }
    if (phase === 1) {
      display += randomChar();
      $(".typed").text(display);

      if (display.length === typedText.length + extra) {
        phase = 2;
      }
    } else if (phase === 2) {
      if (p2Counter >= typedText.length) {
        phase = 3;
        return;
      }

      display =
        display.slice(0, p2Counter) +
        typedText[p2Counter] +
        display.slice(p2Counter + 1);

      p2Counter++;

      $(".typed").text(display);
    } else if (phase === 3) {
      display = display.slice(0, -1);

      $(".typed").text(display);

      if (display === typedText) {
        $(".cursor").hide();
        animationSound.loop = false;
        animationSound.pause();
        animationSound.currentTime = 0;
        clearInterval(interval);
      }
    }
    intervalcounter++
  }, 70);
  setTimeout(()=>{
      $(".agnes").fadeOut(300)
      continueSound.volume = 0.2
      continueSound.currentTime = 0
      continueSound.play()
      $(".continue").addClass("show")
      count=0
      const tempGlitchInterval = setInterval(()=>{
        if (count > 10){
          clearInterval(tempGlitchInterval)
          return
        }
        glitch()
        count++
      },100)
      setTimeout(()=>{
          continueSound.pause()
          continueSound.currentTime = 0
      }, 1000)
  }, 5000)
});

