const $welcome      = $(".welcome");
const $welcomeHead  = $(".welcome-heading");
const $confirmation = $(".confirmation");
const $confHead     = $(".confirmation-heading");
const $bootLog      = $(".boot-log");
const $inputWrap    = $(".input-wrap");
const $input        = $(".password-input");
const $status       = $(".status");
const $container    = $(".container");
const $flash        = $(".flash");

const welcomeText      = $welcomeHead.text().trim();
const confirmationText = $confHead.text().trim();
const bootLines = [
    "> INITIALIZING SECURE CHANNEL ........ <span class='ok'>OK</span>",
    "> VERIFYING ORIGIN ................... <span class='ok'>OK</span>",
    "> AWAITING CREDENTIALS ...............",
];

$confirmation.hide();
$container.hide();
$flash.hide();
$welcomeHead.text("");
$confHead.text("");

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function typeInto($el, text, speed = 70) {
    for (const ch of text) {
        $el.text($el.text() + ch);
        await sleep(speed);
    }
}

async function runBootLog() {
    for (const line of bootLines) {
        $bootLog.append($("<div>").html(line));
        await sleep(350);
    }
}

async function intro() {
    await typeInto($welcomeHead, welcomeText, 70);
    await sleep(800);

    // glitch -> flash -> cut to login
    $welcomeHead.addClass("glitch");
    await sleep(400);
    $welcome.hide();
    $flash.show();
    await sleep(60);
    $flash.hide();

    $confirmation.fadeIn(100);
    await runBootLog();
    await typeInto($confHead, confirmationText, 45);
    $input.trigger("focus");
}

// keep focus on the input while the login is visible
$(document).on("click", () => { if ($confirmation.is(":visible")) $input.trigger("focus"); });

/* ------------ authentication ------------ */
// Replace this with a real server check, e.g.
// return $.post("/admin/login", { password }).then(r => r.ok);
async function verifyPassword(password) {
    if(password === "agnes-architect@123") {
        return true;
    }
    return false;
}

let busy = false;

$input.on("keydown", async e => {
    if (e.key !== "Enter" || busy) return;
    const password = $input.val();
    if (!password) return;

    busy = true;
    $status.removeClass("error success").text("VERIFYING...");

    let ok = false;
    try { ok = await verifyPassword(password); } catch (_) { ok = false; }

    if (ok) {
        $status.addClass("success").text("ACCESS GRANTED");
        $input.prop("disabled", true);
        await sleep(700);
        $flash.show();
        await sleep(80);
        $confirmation.hide();
        $flash.fadeOut(300);
        $container.fadeIn(200);
    } else {
        $status.addClass("error").text("ACCESS DENIED");
        $inputWrap.addClass("shake");
        $input.val("");
        await sleep(450);
        $inputWrap.removeClass("shake");
        busy = false;
    }
});

intro();
