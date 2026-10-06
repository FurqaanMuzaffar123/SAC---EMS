const heading = $("h1")
const flash = $(".flash")

setTimeout(()=>{
    flash.show()
    setTimeout(()=>{
        flash.hide()
    }, 20)
    heading.attr("class", "show")
}, 2000)