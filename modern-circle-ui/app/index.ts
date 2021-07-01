import document from "document";
import { HeartRateSensor } from "heart-rate";
import { display } from "display";
import Clock from "clock";
import { today } from "user-activity";
import { battery } from "power";

import { me } from "appbit";
import * as fs from "fs";
import * as messaging from "messaging";
import { Barometer } from "barometer";
import { Accelerometer } from "accelerometer";
import { OrientationSensor as Orientation } from "orientation";

const SETTINGS_TYPE = "cbor";
const SETTINGS_FILE = "settings.cbor";

const setting = {
    altimeterUnit: { values: [{ name: "m" }] },
    time: { values: [{ name: "24h" }] },
    hoursHand: "#09cddb",
    munutesHand: "#c0ec36",
    secondsHand: "#ec3ba6",
    stepsColor: "white",
    calColor: "white",
    distColor: "white",
    elevationColor: "white",
    warningWaveColor: "#cb9d64",
    dangerWaveColor: "#ea5151",
    normalWaveColor: "#00b0b9",
    heartIconColor: "#09cddb",
    hPaTextColor: "#09cddb",
    hPaCircleColor: "#09cddb",
    batteryCircleColor: "#09cddb",
    batteryTextColor: "#09cddb",
    orientationColor: "#09cddb",
    heightArcColor: "#09cddb",
    heightTextColor: "#09cddb"
};

const settings: Setting = { ...setting, ...loadSettings() };

// Received message containing settings data
messaging.peerSocket.addEventListener("message", function (evt) {
    settings[evt.data.key] = evt.data.value;
    initialize(settings);
})

// Register for the unload event
me.addEventListener("unload", saveSettings);

// Load settings from filesystem
function loadSettings() {
    try {
        return fs.readFileSync(SETTINGS_FILE, SETTINGS_TYPE);
    }
    catch (ex) {
        return {};
    }
}

// Save settings to the filesystem
function saveSettings() {
    fs.writeFileSync(SETTINGS_FILE, settings, SETTINGS_TYPE);
}

// ----------------- APP -------------------

type Setting = typeof setting;

const days = {
    0: "SUN",
    1: "MON",
    2: "TUE",
    3: "WED",
    4: "THU",
    5: "FRI",
    6: "SAT"
};

function dayToText(day: number) {
    return days[day] || "NONE";
}

function clock() {
    const arcHour = document.getElementById("arcHour") as GradientArcElement;
    const arcMin = document.getElementById("arcMin") as GradientArcElement;
    const arcSec = document.getElementById("arcSec") as GradientArcElement;

    const dateText = document.getElementById("dateText") as TextElement;
    const timeText = document.getElementById("timeText") as TextElement;

    Clock.granularity = "seconds";

    function hoursToAngle(hours: number, minutes: number) {
        let hourAngle = (360 / 12) * hours;
        let minAngle = (360 / 12 / 60) * minutes;
        return hourAngle + minAngle;
    }

    // Returns an angle (0-360) for minutes
    function minutesToAngle(minutes: number) {
        return (360 / 60) * minutes;
    }

    // Returns an angle (0-360) for seconds
    function secondsToAngle(seconds: number) {
        return (360 / 60) * seconds;
    }

    // Rotate the hands every tick
    function updateClock() {
        let today = new Date();
        let hours = today.getHours() % 12;
        let mins = today.getMinutes();
        let secs = today.getSeconds();

        arcHour.sweepAngle = hoursToAngle(hours, mins);
        arcMin.sweepAngle = minutesToAngle(mins);
        arcSec.sweepAngle = secondsToAngle(secs);

        dateText.text = `${zeroPad(today.getMonth() + 1, "00")}/${zeroPad(today.getDate(), "00")} ${dayToText(today.getDay())}`;

        if (settings.time.values[0].name === "12h") {
            const hours = today.getHours();
            if (hours <= 12)
                timeText.text = `${zeroPad(today.getHours(), "00")} : ${zeroPad(today.getMinutes(), "00")} AM`;
            else
                timeText.text = `${zeroPad(today.getHours() % 12, "00")} : ${zeroPad(today.getMinutes(), "00")} PM`;
        }
        else
            timeText.text = `${zeroPad(today.getHours(), "00")} : ${zeroPad(today.getMinutes(), "00")}`;
    }

    Clock.addEventListener("tick", updateClock);
}

function zeroPad(n: number, zeros: string) {
    if (n === null) {
        return zeros;
    }

    return (zeros + (n.toString())).slice(-zeros.length);
}

function activity() {
    const stepsIcon = document.getElementById("stepsIcon") as TextElement;
    const stepsText = document.getElementById("stepsText") as TextElement;
    const calIcon = document.getElementById("calIcon") as TextElement;
    const calText = document.getElementById("calText") as TextElement;
    const distIcon = document.getElementById("distIcon") as TextElement;
    const distText = document.getElementById("distText") as TextElement;
    const floorIcon = document.getElementById("floorIcon") as TextElement;
    const floorText = document.getElementById("floorText") as TextElement;

    function renderText() {
        calText.text = zeroPad(today.local.calories, "00000");
        stepsText.text = zeroPad(today.local.steps, "00000");
        distText.text = zeroPad(today.local.distance, "00000");
        floorText.text = zeroPad(today.local.elevationGain, "00000");
    }

    display.addEventListener("change", () => {
        // Automatically stop the sensor when the screen is off to conserve battery
        if (display.on) {
            renderText();
        }
    });
    renderText();
}

function getHeight(hPa: number, temparature = 15) {
    return ((Math.pow(1013.25 / hPa, 1 / 5.257) - 1) * (temparature + 273.15)) / 0.0065;
}

function statsCircle() {
    const batteryArc = document.getElementById("batteryArc") as GradientArcElement;
    const batteryText = document.getElementById("batteryText");
    function update() {
        batteryArc.sweepAngle = (360 * (battery.chargeLevel * 0.01));
        batteryText.text = battery.chargeLevel + "%";
    }

    battery.addEventListener("change", update);
    update();

    if (Barometer) {
        const hPaText = document.getElementById("hPaText") as TextElement;
        const hPaArc = document.getElementById("hPaArc") as GradientArcElement;

        const heightArc = document.getElementById("heightArc") as GradientArcElement;
        const heightText = document.getElementById("heightText") as TextElement;

        const barometer = new Barometer({ frequency: 1 });
        display.addEventListener("change", () => {
            display.on ? barometer.start() : barometer.stop();
        });

        const draw = () => {
            hPaText.text = `${Math.floor(barometer.pressure * 0.01)}hPa`;
            hPaArc.sweepAngle = 360 * (barometer.pressure / 1000000);

            const unit = settings.altimeterUnit.values[0].name;
            const w = unit === "m" ? 1 : 3.2808;
            heightText.text = `${zeroPad(Math.floor(getHeight(barometer.pressure * 0.01) * w), "0000")}${unit}`;
        }

        barometer.addEventListener("reading", () => {
            draw();
        });
        barometer.start();

        return {
            draw
        }
    }

    return {
        draw: () => { }
    }
}

function initEcg() {
    const ecgAnimation1 = document.getElementById("ecgAnimation1") as any;
    const ecgAnimation2 = document.getElementById("ecgAnimation2") as any;
    const heartRateText = document.getElementById("heartRateText") as TextElement;
    const ecgImg = document.getElementById("ecg") as ImageElement;

    function setEcgHeartRate(rate: number) {
        const len = 60 / rate;
        if (len === Infinity) {
            return;
        }

        ecgAnimation1.dur = len;
        ecgAnimation2.dur = len;
    }

    if (HeartRateSensor) {
        const hrm = new HeartRateSensor();

        const draw = () => {
            setEcgHeartRate(hrm.heartRate);
            heartRateText.text = zeroPad(hrm.heartRate, "000");
            ecgImg.style.fill = (() => {
                if (hrm.heartRate >= 120) {
                    return setting.dangerWaveColor;
                }
                else if (hrm.heartRate >= 90) {
                    return setting.warningWaveColor;
                }
                else {
                    return setting.normalWaveColor;
                }
            })();
        }

        hrm.addEventListener("reading", () => {
            draw();
        });
        display.addEventListener("change", () => {
            // Automatically stop the sensor when the screen is off to conserve battery
            display.on ? hrm.start() : hrm.stop();
        });
        hrm.start();

        return {
            draw
        };
    }

    return {
        draw: () => { }
    };
}

const initialize = (data: Setting) => {
    for (const key in data) {
        if (data[key]) {
            setting[key] = data[key];
        }
    }

    // Colck Colors
    const arcHour = document.getElementById("arcHour") as GradientArcElement;
    const arcMin = document.getElementById("arcMin") as GradientArcElement;
    const arcSec = document.getElementById("arcSec") as GradientArcElement;
    arcHour.style.fill = setting.hoursHand;
    arcMin.style.fill = setting.munutesHand;
    arcSec.style.fill = setting.secondsHand;

    // Stats Colors
    const stepsIcon = document.getElementById("stepsIcon") as TextElement;
    const stepsText = document.getElementById("stepsText") as TextElement;
    const calIcon = document.getElementById("calIcon") as TextElement;
    const calText = document.getElementById("calText") as TextElement;
    const distIcon = document.getElementById("distIcon") as TextElement;
    const distText = document.getElementById("distText") as TextElement;
    const floorIcon = document.getElementById("floorIcon") as TextElement;
    const floorText = document.getElementById("floorText") as TextElement;

    stepsIcon.style.fill = setting.stepsColor;
    stepsText.style.fill = setting.stepsColor;
    calIcon.style.fill = setting.calColor;
    calText.style.fill = setting.calColor;
    distIcon.style.fill = setting.distColor;
    distText.style.fill = setting.distColor
    floorIcon.style.fill = setting.elevationColor;
    floorText.style.fill = setting.elevationColor;

    // stats meter color
    const hPaIcon = document.getElementById("hPaIcon") as ImageElement;
    const hPaText = document.getElementById("hPaText") as TextElement;
    const hPaArc = document.getElementById("hPaArc") as GradientArcElement;
    // const hPaIcon = document.getElementById("hPaIcon") as ImageElement;
    const batteryIcon = document.getElementById("batteryIcon") as ImageElement;
    const batteryText = document.getElementById("batteryText") as TextElement;
    const batteryArc = document.getElementById("batteryArc") as GradientArcElement;

    const heightText = document.getElementById("heightText") as TextElement;
    const heightArc = document.getElementById("heightArc") as GradientArcElement;
    const heightIcon = document.getElementById("heightIcon") as ImageElement;

    batteryIcon.style.fill = setting.batteryTextColor;
    batteryText.style.fill = setting.batteryTextColor;
    batteryArc.style.fill = setting.batteryCircleColor;

    hPaIcon.style.fill = setting.hPaTextColor;
    hPaText.style.fill = setting.hPaTextColor;
    hPaArc.style.fill = setting.hPaCircleColor;

    heightText.style.fill = setting.heightTextColor;
    heightArc.style.fill = setting.heightArcColor;
    heightIcon.style.fill = setting.heightTextColor;

    // ECG
    const heartRateIcon = document.getElementById("heartRateIcon") as ImageElement;
    heartRateIcon.style.fill = setting.heartIconColor;

    ecgContext.draw();
    statsContext.draw();
};

const ecgContext = initEcg();
clock();
activity();
const statsContext = statsCircle();
initialize(settings);