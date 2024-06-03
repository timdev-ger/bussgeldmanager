function searchFine() {
    let searchFor = document.getElementById("searchbar_input").value.toLocaleLowerCase()
    
    let fines = document.querySelectorAll(".fine");
    for (var i = 0; i < fines.length; i++) {
        if (fines[i].querySelectorAll(".fineText")[0].innerHTML.toLocaleLowerCase().includes(searchFor)) {
            fines[i].classList.add("showing")
            fines[i].classList.remove("hiding")
        } else {
            fines[i].classList.remove("showing")
            fines[i].classList.add("hiding")
        }
        
    }
}

function selectFine(event) {
    let element = event.target
    if (element.tagName == "FONT") return
    if (element.tagName == "TD") element = element.parentElement
    if (element.tagName == "I") element = element.parentElement.parentElement

    if (element.classList.contains("selected")) {
        element.classList.remove("selected")
    } else {
        element.classList.add("selected")
    }

    startCalculating()
}

function startCalculating() {
    document.getElementById("finesListTable").innerHTML = `
        <tr>
            <th style="width: 80%;">Grund für die Geldstrafe</th>
            <th style="width: 20%;">Bußgeld</th>
        </tr>`;

    let fineResult = document.getElementById("fineResult");
    let fineAmount = 0;
    let fineCollection = document.querySelectorAll(".selected");
    let totalWantedAmount = 0;
    let totalFineAmount = 0;

    for (let i = 0; i < fineCollection.length; i++) {
        let cache_wanted_amount = parseInt(fineCollection[i].querySelector(".wantedAmount").getAttribute("data-wantedamount")) || 0;
        let selectedExtraWanteds = fineCollection[i].querySelector(".wantedAmount").querySelectorAll(".selected_extrawanted").length;

        if ((cache_wanted_amount + selectedExtraWanteds) > 5) {
            cache_wanted_amount = 5;
        } else {
            cache_wanted_amount += selectedExtraWanteds;
        }

        totalWantedAmount += cache_wanted_amount;

        let cache_fine_amount = parseInt(fineCollection[i].querySelector(".fineAmount").getAttribute("data-fineamount")) || 0;
        let extraFines = fineCollection[i].querySelector(".wantedAmount").querySelectorAll(".selected_extrawanted");

        extraFines.forEach(extraFine => {
            if (extraFine.getAttribute("data-addedfine")) {
                cache_fine_amount += parseInt(extraFine.getAttribute("data-addedfine")) || 0;
            }
        });

        totalFineAmount += cache_fine_amount;
    }

    console.log("Total Wanted Amount:", totalWantedAmount);
    console.log("Total Fine Amount:", totalFineAmount);

    let wantedAmount = totalWantedAmount;
    let fineAmount = totalFineAmount;

    if (wantedAmount === undefined) wantedAmount = 0;
    if (fineAmount === undefined) fineAmount = 0;

    let reasonText = "";
    let plate = document.getElementById("plateInput_input").value;
    let systemwanteds = document.getElementById("systemwantedsInput_input").value;
    let blitzerort = document.getElementById("blitzerInput_input").value;
    let infoResult = document.getElementById("infoResult");
    let noticeText = "";
    let removeWeaponLicense = false;
    let removeDriverLicense = false;
    let removeFlyLicense = false;
    let tvübergabe_org = document.getElementById("übergabeInput_select").value;
    let tvübergabe_name = document.getElementById("übergabeInput_input").value;
    let shortMode = document.getElementById("checkbox_box").checked;

    fineCollection.forEach(fine => {
        const d = new Date();
        const localTime = d.getTime();
        const localOffset = d.getTimezoneOffset() * 60000;
        const utc = localTime + localOffset;
        const offset = 2; // UTC of Germany Time Zone is +01.00
        const germany = utc + (3600000 * offset);
        let now = new Date(germany);

        let hour = now.getHours().toString().padStart(2, '0');
        let minute = now.getMinutes().toString().padStart(2, '0');
        let day = now.getDate().toString().padStart(2, '0');
        let month = (now.getMonth() + 1).toString().padStart(2, '0');

        let fineText = fine.querySelector(".fineText").innerHTML.split("<i>")[0];
        let paragraph = fine.querySelector(".paragraph").innerHTML;

        if (shortMode) {
            reasonText = reasonText ? `${reasonText} + ${day}.${month} ${hour}:${minute} - ${paragraph}` : `${day}.${month} ${hour}:${minute} - ${paragraph}`;
        } else {
            reasonText = reasonText ? `${reasonText} + ${day}.${month} ${hour}:${minute} - ${paragraph} - ${fineText}` : `${day}.${month} ${hour}:${minute} - ${paragraph} - ${fineText}`;
        }

        if (fine.getAttribute("data-removedriverlicence") == "true") removeDriverLicense = true;
        if (fine.getAttribute("data-removeweaponlicence") == "true") removeWeaponLicense = true;
        if (fine.getAttribute("data-removeflylicence") == "true") removeFlyLicense = true;

        let extraFines = 0;
        fine.querySelectorAll(".wantedAmount .selected_extrawanted").forEach(extra => {
            extraFines += parseInt(extra.getAttribute("data-addedfine")) || 0;
        });

        document.getElementById("finesListTable").innerHTML += `
            <tr class="finesList_fine">
                <td onclick="JavaScript:copyText(event)">${day}.${month} ${hour}:${minute} - ${paragraph} - ${fineText}${plate ? " - " + plate.toUpperCase() : ""}${blitzerort ? " - " + blitzerort : ""}</td>
                <td>$${parseInt(fine.querySelector(".fineAmount").getAttribute("data-fineamount")) + extraFines}</td>
            </tr>
        `;
    });

    if (document.getElementById("reue_box").checked && wantedAmount !== 0) {
        wantedAmount -= 2;
        if (wantedAmount < 1) wantedAmount = 1;
    }

    if (plate) reasonText += ` (Kennzeichen: ${plate.toUpperCase()})`;
    if (blitzerort) reasonText += ` - ${blitzerort}`;
    if (document.getElementById("reue_box").checked) reasonText += ` - StGB §35`;
    if (systemwanteds) reasonText += ` + ${systemwanteds} Systemwanteds`;

    if (!isNaN(systemwanteds) && systemwanteds) {
        wantedAmount += parseInt(systemwanteds);
        if (wantedAmount > 5) wantedAmount = 5;
    }

    if (document.getElementById("systemfehler_box").checked) {
        reasonText += ` - Systemfehler`;
    }

    if (removeDriverLicense) noticeText = "Führerschein entziehen";
    if (removeWeaponLicense) noticeText = noticeText ? `${noticeText} + Waffenschein entziehen` : "Waffenschein entziehen";
    if (removeFlyLicense) noticeText = noticeText ? `${noticeText} + Flugschein entziehen` : "Flugschein entziehen";

    if (tvübergabe_org !== "none" && tvübergabe_name) {
        reasonText += ` - @${tvübergabe_org.toUpperCase()} ${tvübergabe_name}`;
    }

    infoResult.innerHTML = `<b>Information:</b> ${noticeText}`;
    fineResult.innerHTML = `<b>Geldstrafe:</b> <font style="user-select: all;">$${fineAmount}</font>`;
    document.getElementById("wantedResult").innerHTML = `<b>Wanteds:</b> <font style="user-select: all;">${wantedAmount}</font>`;
    document.getElementById("reasonResult").innerHTML = `<b>Grund:</b> <font style="user-select: all;" onclick="JavaScript:copyText(event)">${reasonText}</font>`;

    document.getElementById("characterResult").innerHTML = reasonText.length <= 150
        ? `<b>Zeichen:</b> ${reasonText.length}/150`
        : `<b>Zeichen:</b> <font style="color: red;">${reasonText.length}/150<br>Dieser Grund ist zu lang!</font>`;
}



function showFines() {
    if (document.getElementById("finesListContainer").style.opacity == 0) {
        document.getElementById("finesListContainer").style.opacity = 1
        document.getElementById("finesListContainer").style.pointerEvents = ""
    } else {
        document.getElementById("finesListContainer").style.opacity = 0
        document.getElementById("finesListContainer").style.pointerEvents = "none"
    }
} 

function showAttorneys() {
    if (document.getElementById("attorneyContainer").style.opacity == 0) {
        document.getElementById("attorneyContainer").style.opacity = 1
        document.getElementById("attorneyContainer").style.pointerEvents = ""
    } else {
        document.getElementById("attorneyContainer").style.opacity = 0
        document.getElementById("attorneyContainer").style.pointerEvents = "none"
    }
} 


window.onload = async () => {
    let savedBody;
    let alreadyBig = true

    await sleep(Math.round(Math.random() * 2500))

    document.body.innerHTML = document.getElementById("scriptingDiv").innerHTML
    savedBody = document.body.innerHTML

    openDisclaimer()

    setInterval(() => {
        if (document.body.clientWidth < 700) {
            alreadyBig = false
            document.body.innerHTML = `
            <div style="transform: translate(-50%, -50%); font-weight: 600; font-size: 8vw; color: white; width: 80%; position: relative; left: 50%; top: 50%; text-align: center;">Diese Website kann nur auf einem PC angesehen werden<div>
            `
            document.body.style.backgroundColor = "#121212"
        } else if (alreadyBig == false) {
            alreadyBig = true
            location.reload()
        }
    }, 1)
}

function resetButton() {
    let fineCollection = document.querySelectorAll(".selected")
    for (var i = 0; i < fineCollection.length; i++) {
        fineCollection[i].classList.remove("selected")
    }

    document.getElementById("plateInput_input").value = ""
    document.getElementById("blitzerInput_input").value = ""
    document.getElementById("systemwantedsInput_input").value = ""

    document.getElementById("übergabeInput_select").value = "none"
    document.getElementById("übergabeInput_input").value = ""

    document.getElementById("notepadArea_input").value = ""
    
    document.getElementById("reue_box").checked = false
    document.getElementById("systemfehler_box").checked = false

    startCalculating()
}

function copyText(event) {
    let target = event.target
    // Get the text field
    var copyText = target.innerHTML
  
    // Copy the text inside the text field
    navigator.clipboard.writeText(copyText.replace("<br>", ""));

    insertNotification("success", "Der Text wurde kopiert.", 5)
}

function toggleExtraWanted(event) {
    let target = event.target
    let extrastarNumber = 0
    let isSelected = false
    let isLead = false

    if(target.classList.contains("extrawanted1")) extrastarNumber = 1
    if(target.classList.contains("extrawanted2")) extrastarNumber = 2
    if(target.classList.contains("extrawanted3")) extrastarNumber = 3
    if(target.classList.contains("extrawanted4")) extrastarNumber = 4
    if(target.classList.contains("extrawanted5")) extrastarNumber = 5


    if (target.classList.contains("selected_extrawanted")) isSelected = true

    if (isSelected && target.parentElement.querySelectorAll(".selected_extrawanted").length == extrastarNumber) isLead = true

    if (isSelected && isLead) {


        let foundEnabled = target.parentElement.querySelectorAll(".selected_extrawanted")
        for (let i = 0; i < foundEnabled.length; i++) {
            foundEnabled[i].classList.remove("selected_extrawanted")
            
        }

        startCalculating()
        return
    }

    if (isSelected) {


        let found = target.parentElement.querySelectorAll(".extrawanted")
        for (let i = 0; i < found.length; i++) {
            if (i + 1 > extrastarNumber) {

                found[i].classList.remove("selected_extrawanted")
            }
            
        }

        startCalculating()
        return
    }

    if (!isSelected) {
        let found = target.parentElement.querySelectorAll(".extrawanted")
        for (let i = 0; i < extrastarNumber; i++) {
            found[i].classList.add("selected_extrawanted")
            
        }
    }

    startCalculating()
    //for (let index = 0; index < extrastarNumber; index++) {
    //    const element = array[index];    
    //}
}

setInterval(() => {
    if (document.getElementById("disclaimer_title_warning").style.color == "rgb(255, 73, 73)") {
        document.getElementById("disclaimer_title_warning").style.color = "rgb(255, 255, 255)"
    } else {
        document.getElementById("disclaimer_title_warning").style.color = "rgb(255, 73, 73)"
    }
}, 1000)

async function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function disclaimerAccepted() {
    // Disable Accept Button to prevent stacking of events
    document.getElementById("disclaimer_button").setAttribute("disabled", "")

    let disclaimerNode = document.getElementById("disclaimer")
    disclaimerNode.style.boxShadow = "rgba(0, 0, 0, 0.219) 0px 0px 70px 0vw"

    disclaimerNode.style.opacity = 0
    document.body.removeChild(document.getElementById("disclaimerBackgroundBlocker"))

    await sleep(1000)

    disclaimerNode.style.display = "none"
}

async function openDisclaimer() {
    await sleep(500) // Let the page load

    let disclaimerNode = document.getElementById("disclaimer")
    disclaimerNode.style.opacity = 1


    disclaimerNode.style.boxShadow = "rgba(0, 0, 0, 0.219) 0px 0px 70px 30vw"
}