
  
// const data = city_data_fr.data;
//     const city_value = [],
//         city_name = [];
    
//     data.forEach(city => {
//         city_value.push(city.nom_sans_accent);
//         city_name.push(city.nom_standard);
//     });
window.onload = () => {
    let cityEl = document.getElementById("city")
    if (cityEl) cityEl.addEventListener("keyup", onkeyUp)

    let cityDiv = document.getElementById("citydiv")
    if (cityDiv) cityDiv.addEventListener("click", event.stopImmediatePropagation())

    let dropdownLiEl = document.querySelectorAll("#dropdown li")
    dropdownLiEl.forEach(el => {
        el.addEventListener("click", () => { 
            selectOption(el.dataset.option1,el.dataset.option2,el.dataset.option3) 
        })
    })
}


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


function listAllEventListeners() {
  const allElements = Array.prototype.slice.call(document.querySelectorAll('*'));
  allElements.push(document);
  allElements.push(window);

  const types = [];

  for (let ev in window) {
    if (/^on/.test(ev)) types[types.length] = ev;
  }

  let elements = [];
  for (let i = 0; i < allElements.length; i++) {
    const currentElement = allElements[i];
    for (let j = 0; j < types.length; j++) {
      if (typeof currentElement[types[j]] === 'function') {
        elements.push({
          "node": currentElement,
          "type": types[j],
          "func": currentElement[types[j]].toString(),
        });
      }
    }
  }

  return elements.sort(function(a,b) {
    return a.type.localeCompare(b.type);
  });
}