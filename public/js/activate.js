const passwords= $(".password")
const btn = $(".showPass")

function resetPasswordVisibility(){
    passwords.attr("type","password")
}

btn.on("pointerdown", ()=>{
    passwords.attr("type","text")
})

btn.on("pointerup",resetPasswordVisibility)
btn.on("pointerleave",resetPasswordVisibility)
btn.on("pointercancel",resetPasswordVisibility) 