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

function setCurrentTime() {
	const input = document.getElementById('cuffTimeInput_Input');
	const now = new Date();
	const hours = String(now.getHours()).padStart(2, '0');
	const minutes = String(now.getMinutes()).padStart(2, '0');
	input.value = `${hours}:${minutes}`;
}

function startCalculating() {

    document.getElementById("finesListTable").innerHTML = `<tr>
                    <th style="width: 80%;">Grund für die Geldstrafe</th>
                    <th style="width: 20%;">Bußgeld</th>
                </tr>`

    let fineResult = document.getElementById("fineResult")
    let wantedResult = document.getElementById("wantedsResult")
    let reasonResult = document.getElementById("reasonResult")
	// let fineOutput = document.getElementById("fineOutput")
    let systemwanteds = document.getElementById("systemwantedsInput_input").value
    let blitzerort = document.getElementById("cuffTimeInput_Input").value
    let infoResult = document.getElementById("infoResult")
    let tvübergabe_org = document.getElementById("übergabeInput_select").value
    let tvübergabe_name = document.getElementById("übergabeInput_input").value
	
	let reasonText = ""
	let wantedText = ""
    let noticeText = ""
	let fineListing = ""
	
    let removeWeaponLicense = false
    let removeDriverLicense = false
	
	let splitAmount = 0
    let wantedAmount = 0
	let fineAmount = 0	

    let fineCollection = document.querySelectorAll(".selected")
    let fineCollectionWantedAmount = []
    let fineCollectionFineAmount = []

    for (var i = 0; i < fineCollection.length; i++) { 

        let cache_wanted_amount = 0;
		let cache_fine_amount = 0;

        cache_wanted_amount = cache_wanted_amount + parseInt(fineCollection[i].querySelector(".wantedAmount").getAttribute("data-wantedamount"))
        cache_wanted_amount = cache_wanted_amount + fineCollection[i].querySelector(".wantedAmount").querySelectorAll(".selected_extrawanted").length
		
        if (cache_wanted_amount > 5) {
			cache_wanted_amount = 5
		}

        fineCollectionWantedAmount.push(cache_wanted_amount)

        cache_fine_amount = cache_fine_amount + parseInt(fineCollection[i].querySelector(".fineAmount").getAttribute("data-fineamount"))

        let extrawanteds_found = fineCollection[i].querySelector(".wantedAmount").querySelectorAll(".selected_extrawanted")
        let extrafines_amount = 0
		
        for (let b = 0; b < extrawanteds_found.length; b++) {
            if (extrawanteds_found[b].getAttribute("data-addedfine")) {
				cache_fine_amount = cache_fine_amount + parseInt(extrawanteds_found[b].getAttribute("data-addedfine"))
			}
			
            extrafines_amount = extrafines_amount + parseInt(extrawanteds_found[b].getAttribute("data-addedfine"))
        }

        fineCollectionFineAmount.push(cache_fine_amount)

    }

    console.log(fineCollectionWantedAmount);	
	console.log(wantedAmount);  
	console.log(fineAmount); 

    for (var i = 0; i < fineCollection.length; i++) {
        fineAmount = fineAmount + parseInt(fineCollection[i].querySelector(".fineAmount").getAttribute("data-fineamount"))

        let extrawanteds_found = fineCollection[i].querySelector(".wantedAmount").querySelectorAll(".selected_extrawanted")
        let extrafines_amount = 0
        for (let b = 0; b < extrawanteds_found.length; b++) {
            if (extrawanteds_found[b].getAttribute("data-addedfine")) fineAmount = fineAmount + parseInt(extrawanteds_found[b].getAttribute("data-addedfine"))
            extrafines_amount = extrafines_amount + parseInt(extrawanteds_found[b].getAttribute("data-addedfine"))
        }

        wantedAmount = wantedAmount + parseInt(fineCollection[i].querySelector(".wantedAmount").getAttribute("data-wantedamount"))
        
        wantedAmount = wantedAmount + fineCollection[i].querySelector(".wantedAmount").querySelectorAll(".selected_extrawanted").length
        if (wantedAmount > 5) wantedAmount = 5
        

        const d = new Date();
        const localTime = d.getTime();
        const localOffset = d.getTimezoneOffset() * 60000;
        const utc = localTime + localOffset;
        const offset = 2; // UTC of Germany Time Zone is +01.00
        const germany = utc + (3600000 * offset);
        let now = new Date(germany);

        let hour = now.getHours();
        if (hour < 10) hour = "0" + hour

        let minute = now.getMinutes();
        if (minute < 10) minute = "0" + minute

        let day = now.getDate()
        if (day < 10) day = "0" + day

        let month = now.getMonth() + 1
        if (month < 10) month = "0" + month

        let fineText = ""
        if (fineCollection[i].querySelector(".fineText").innerHTML.includes("<i>")) {
            fineText = fineCollection[i].querySelector(".fineText").innerHTML.split("<i>")[0]
        } else {
            fineText = fineCollection[i].querySelector(".fineText").innerHTML
        }
		
	
		if (reasonText == "") {
			reasonText = `${day}.${month} ${hour}:${minute} | ${fineCollection[i].querySelector(".paragraph").hasAttribute("data-paragraphAddition") ? fineCollection[i].querySelector(".paragraph").getAttribute("data-paragraphAddition") + " " : ""}${fineCollection[i].querySelector(".paragraph").innerHTML}`
		} else {
			reasonText += ` ${fineCollection[i].querySelector(".paragraph").hasAttribute("data-paragraphAddition") ? fineCollection[i].querySelector(".paragraph").getAttribute("data-paragraphAddition") + " " : ""}${fineCollection[i].querySelector(".paragraph").innerHTML}`
		}
		
        if (fineCollection[i].getAttribute("data-removedriverlicence") == "true") removeDriverLicense = true
        if (fineCollection[i].getAttribute("data-removeweaponlicence") == "true") removeWeaponLicense = true
    }

    if (document.getElementById("reue_box").checked && wantedAmount !== 0) { // Means "reue" is active
        wantedAmount = wantedAmount - 2
        if (wantedAmount < 1) wantedAmount = 1
    }

    if (blitzerort != "") {
        reasonText += ` | Cuffs: ${blitzerort}`
    }

    if (document.getElementById("reue_box").checked) {
        reasonText += ` - StGB §35`
    }

    if (systemwanteds != "") {
        reasonText += ` + ${systemwanteds} Systemwanteds`
    }

    if (!isNaN(systemwanteds) && systemwanteds !== "") {
        wantedAmount = wantedAmount + parseInt(systemwanteds)
        if (wantedAmount > 5) wantedAmount = 5
    }

    if (document.getElementById("systemfehler_box").checked) {
        reasonText += ` - Systemfehler`
    }


    if (removeDriverLicense) {
        noticeText = "Führerschein entziehen"
    }
    if (removeWeaponLicense) {
        if (noticeText =="") {
            noticeText = "Waffenschein entziehen"
        } else {
            noticeText = noticeText + " + Waffenschein entziehen"
        }
    }

    if (tvübergabe_org !== "none" && tvübergabe_name !== "") {
        reasonText += ` - @${tvübergabe_org.toLocaleUpperCase()} ${tvübergabe_name}`
    }
	
	if (fineAmount > 0) {
		let splitAmount = Math.ceil(fineAmount / 50000);
		
		console.log(splitAmount)
		
		if (splitAmount < 1) {
			splitAmount = 1
		} 
		if (splitAmount >= 1.1 && splitAmount <= 1.5) {
			splitAmount = 2
		} 
		if (splitAmount >= 2.1 && splitAmount <= 2.5) {
			splitAmount = 3
		} 
		if (splitAmount >= 3.1 && splitAmount <= 3.5) {
			splitAmount = 4
		}
		if (splitAmount >= 4.1 && splitAmount <= 4.5) {
			splitAmount = 5
		}
		
		for (var i = 1; i <= splitAmount; i++) {
			
			if (fineListing == "") {
				fineListing = `<font style="user-select: all;" onclick="JavaScript:copyText(event)">${reasonText} | $${fineAmount} | ${i}/${splitAmount}</font><br>`
			} else {
				fineListing += `<font style="user-select: all;" onclick="JavaScript:copyText(event)">${reasonText} | $${fineAmount} | ${i}/${splitAmount}</font><br>`
			}
		}
		
		if (wantedAmount == 1) {
			reasonText += ` | ⭐`
			wantedText = `⭐`
		} else if (wantedAmount == 2) {
			reasonText += ` | ⭐⭐`
			wantedText = `⭐⭐`
		} else if (wantedAmount == 3) {
			reasonText += ` | ⭐⭐⭐`
			wantedText = `⭐⭐⭐`
		} else if (wantedAmount == 4) {
			reasonText += ` | ⭐⭐⭐⭐`
			wantedText = `⭐⭐⭐⭐`
		} else if (wantedAmount == 5) {
			reasonText += ` | ⭐⭐⭐⭐⭐`
			wantedText = `⭐⭐⭐⭐⭐`
		}
	}
	
    infoResult.innerHTML = `<b>Information:</b> ${noticeText}`
    fineResult.innerHTML = `<b>Geldstrafe:</b> <font style="user-select: all;">$${fineAmount}</font>`
    wantedResult.innerHTML = `<b>Wanteds:</b> <font style="user-select: all;">${wantedAmount}</font>`
    reasonResult.innerHTML = `<b>Grund:<br></b> <font style="user-select: all;" onclick="JavaScript:copyText(event)">${reasonText}</font><br>`
	fineOutput.innerHTML = `<b>Bußgelder:<br></b> ${fineListing}<br>`

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

/*
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
}*/

function resetButton() {
    let fineCollection = document.querySelectorAll(".selected")
    for (var i = 0; i < fineCollection.length; i++) {
        fineCollection[i].classList.remove("selected")
    }

    document.getElementById("cuffTimeInput_Input").value = ""
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
    
    var copyText = target.innerHTML
  
    navigator.clipboard.writeText(copyText.replace("<br>", ""));

    insertNotification("success", "Die Strafen wurden erfolgreich in deine Zwischenablage kopiert.", 5)
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