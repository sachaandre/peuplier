const toggleElements = document.querySelectorAll("[data-collapse-toggle]");

for(let toggleElement of toggleElements){
    toggleElement.addEventListener("click", function(){
        const elementId = this.dataset.collapseToggle;
        
        const menu = document.querySelector(elementId);
        menu.classList.toggle("hidden");
        menu.classList.toggle("block");
        menu.classList.toggle("transition-all");

        toggleElement.classList.toggle("bg-indigo-400");
        toggleElement.classList.toggle("rounded-full");
        toggleElement.classList.toggle("shadow-md");

        const burgerPath = document.getElementById("burger_path");
        burgerPath.getAttribute("stroke") == "black" ? burgerPath.setAttribute("stroke", "white") : burgerPath.setAttribute("stroke", "black");
    });
}