let isMobile = window.matchMedia("(pointer:coarse)").matches

const btn = $(".showPass")
const passwords= $(".password")

function togglePassword(){
    passwords.attr("type",passwords.attr("type")==="password"?"text":"password")
}

if (isMobile){
    btn.on("touchstart", ()=>{
        passwords.attr("type","text")
        btn.attr("src","/images/crossed_eye.png")
    })
    btn.on("touchend",()=>{
        passwords.attr("type","password")
        btn.attr("src","/images/eye.png")
    })
}else{
    btn.on("click",togglePassword)
}