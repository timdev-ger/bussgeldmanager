function startCalculating() {
    document.getElementById("finesListTable").innerHTML = `<tr>
                    <th style="width: 80%;">Grund für die Geldstrafe</th>
                    <th style="width: 20%;">Bußgeld</th>
                </tr>`

    let fineResult = document.getElementById("fineResult");
    let fineAmount = 0;
    let fineCollection = document.querySelectorAll(".selected");
    let totalWantedAmount = 0;
    let totalFineAmount = 0;

    for (var i = 0; i < fineCollection.length; i++) {
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
    document.getElementById("wantedsResult").innerHTML = `<b>Wanteds:</b> <font style="user-select: all;">${wantedAmount}</font>`;
    document.getElementById("reasonResult").innerHTML = `<b>Grund:</b> <font style="user-select: all;" onclick="JavaScript:copyText(event)">${reasonText}</font>`;

    document.getElementById("charactersResult").innerHTML = reasonText.length <= 150
        ? `<b>Zeichen:</b> ${reasonText.length}/150`
        : `<b>Zeichen:</b> <font style="color: red;">${reasonText.length}/150<br>Dieser Grund ist zu lang!</font>`;
}
