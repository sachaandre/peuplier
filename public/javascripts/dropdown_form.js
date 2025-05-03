
  
// const data = city_data_fr.data;
//     const city_value = [],
//         city_name = [];
    
//     data.forEach(city => {
//         city_value.push(city.nom_sans_accent);
//         city_name.push(city.nom_standard);
//     });

function onkeyUp(e){
    let keyword = (e.target.value);
    
    const dropdownEl = document.getElementById("dropdown");
    if (keyword.length > 0) {
        dropdownEl.classList.remove("hidden");
    } else {
        dropdownEl.classList.add("hidden");
    }

    let lowerKeyword = keyword.toLowerCase();
    hideOptions(lowerKeyword);
}


function selectOption(selectedOptionVal, selectedOptionText, fieldId){
    hideDropdown();
    let field = document.getElementById(fieldId);
    field.setAttribute("value", selectedOptionVal);
    field.value = selectedOptionText;
}

document.addEventListener("click", () => {
    hideDropdown();
});

function hideDropdown() {
    let dropdownEl = document.getElementById("dropdown");
    if(!dropdownEl.classList.contains("hidden")) {
        dropdownEl.classList.add("hidden");
    }
}

function hideOptions(filteredKeyword){
    const skw = sanitizeKeyword(filteredKeyword);
    let isAlphabetic = /^[[A-Za-z' àéêèûôùìç-]+$/.test(skw);
    if (skw.length > 0 && isAlphabetic){
        let allOptionstoHide = document.querySelectorAll(`li:not([id^=${skw}])`);
        let allOptionstoDisplay = document.querySelectorAll(`li[id^=${skw}]`);
        allOptionstoHide.forEach(liEl => {
            if(!liEl.classList.contains("hidden")) { liEl.classList.toggle("hidden") } 
        });

        allOptionstoDisplay.forEach(liEl => {
            if(liEl.classList.contains("hidden")) { liEl.classList.toggle("hidden") } 
        });
    } else {
        hideDropdown();
    }
}

function sanitizeKeyword(keyword){
    //Trim Keyword
    let sanitizedKeyword = keyword.trim();
    // Transform whitespaces and apostrophes into dashes
    sanitizedKeyword = sanitizedKeyword.replace(/\s|[']+/g, '-');
    // Remove accents
    sanitizedKeyword = sanitizedKeyword.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    return sanitizedKeyword;
}