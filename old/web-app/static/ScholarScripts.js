const colors = ["#F0F8FF","#FAEBD7","#F5F5DC","#FFE4C4","#E6E6FA","#FFF0F5","#FFFACD","#F0FFF0","#FAFAD2","#D3D3D3"];

/* --- Scholar --- */
document.addEventListener("DOMContentLoaded", () => {
  const spans = document.querySelectorAll(".verb, .adj, .noun, .aux");
  spans.forEach((span) => {
    span.addEventListener("click", async (event) => {
      const radioButton = document.querySelector("#explainWords");
      if (radioButton && !radioButton.checked) {
        return;
      }
      sentence_of_origin = span.closest(".sentence");

      var context = "";
      for (const child of sentence_of_origin.children) {
        context = context + " " + child.textContent;
      }
      const word = event.target.textContent;
      const response = await fetch(`http://localhost:5000/look-up-word`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: word, sentence: context }),
      });
      result = await response.json();

      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      

      var spans = document.getElementsByTagName("span");
      for (var i = 0; i < spans.length; i++) {
          if (spans[i].textContent === word) {
            spans[i].style.backgroundColor = randomColor;        
          }
      }



      if (result.result == "error") {
        alert("Incorrect API key provided: " + result.word);
      } else {
        let table = document.querySelector(".table-glossary");
        let newRow = table.insertRow(-1);
        let cell1 = newRow.insertCell(0);
        cell1.style.backgroundColor = randomColor;
        let cell2 = newRow.insertCell(1);
        let cell3 = newRow.insertCell(2);
        let cell4 = newRow.insertCell(3);
        cell1.innerHTML = result.word;
        cell2.innerHTML = result.pos;
        cell3.innerHTML = result.result;
        cell4.innerHTML = result.lemma;
      }
    });
  });
});


function addColors(){
  var selection = window.getSelection();
  if (selection.rangeCount > 0) {
    var range = selection.getRangeAt(0);
    var commonAncestor = range.commonAncestorContainer;
    var selectedElements = commonAncestor.getElementsByClassName("sentence");
    var selectedTags = [];
    for (var i = 0; i < selectedElements.length; i++) {
      var elementRange = document.createRange();
      elementRange.selectNodeContents(selectedElements[i]);

      if (range.intersectsNode(selectedElements[i])) {
        selectedElements[i].parentNode.className = "old";
        selectedTags.push(selectedElements[i]);
      }
    }
  }

  const lastElement = selectedTags[selectedTags.length - 1];
  const parentElement = lastElement.parentNode;
  parentElement.className = "old";

  return parentElement;
}

/* --- */
async function simplification() {
  var selectedText = window.getSelection().toString();

  if (selectedText == "" || selectedText == null) {
    alert("Markeer de tekst die u wilt vereenvoudigen.");
    return;
  }

  var parentElement = addColors();

  const response = await fetch(`http://localhost:5000/simplify-scholar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: "Vereenvoudig deze tekst ///" + selectedText }),
  });

  result = await response.json();
  const newElement = document.createElement("p");
  newElement.className = "simplified";
  newElement.textContent = result.result;
  parentElement.insertAdjacentElement("afterend", newElement);
}

/*

*/
async function personalizedSimplification() {
  var selectedText = window.getSelection().toString();

  if (selectedText == "" || selectedText == null) {
    alert("Markeer de tekst die u wilt vereenvoudigen.");
    return;
  }

  var parentElement = addColors();

  var selectedText = window.getSelection().toString();
  if (selectedText == "" || selectedText == null) {
    alert("Markeer de tekst die u wilt vereenvoudigen.");
    return;
  }

  let checkedValues = [];
  let checkboxes = document.querySelectorAll(
    '.personalisation input[type="checkbox"]'
  );

  checkboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      checkedValues.push(checkbox.name);
    }
  });

  if (checkedValues.length == 0) {
    alert("Duidt één van de onderstaande opties aan.");
    return;
  }

  if (checkedValues.includes('table')) {
    prompt = `
    Herschrijf de tekstinhoud naar een tabel en gebruik twee kolommen naar keuze . Gebruik hiervoor html-code.
    ///
    ${selectedText}
    `;
  } else {
    prompt = `
    Vereenvoudig de zinnen in het Nederlands met de volgende kenmerken: ${checkedValues.join(', ')}
    ///
    ${selectedText}
    `;
  }

  const response = await fetch(`http://localhost:5000/simplify-scholar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: prompt }),
  });

  result = await response.json();
  const newElement = document.createElement("p");
  newElement.className = "simplified";
  newElement.innerHTML = result.result;
  parentElement.insertAdjacentElement("afterend", newElement);
}


/*

*/
async function askGPT() {
  var selectedText = window.getSelection().toString();
  if (selectedText == "" || selectedText == null) {
    alert("Markeer de tekst die u wilt vereenvoudigen.");
    return;
  }

  let promptText = prompt("What's your name");

  var parentElement = addColors();

  const response = await fetch(`http://localhost:5000/simplify-scholar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: promptText + "///\n" + selectedText }),
  });

  result = await response.json();
  const newElement = document.createElement("p");
  newElement.className = "simplified";
  newElement.textContent = result.result;
  parentElement.insertAdjacentElement("afterend", newElement);
}

document.getElementById('showOriginal').addEventListener('change', function() {
  if (this.checked) {
    var elements = document.getElementsByClassName("old");
    for (var i = 0; i < elements.length; i++) {
        elements[i].style.display = "block";
    }
  } else {
    var elements = document.getElementsByClassName("old");
    for (var i = 0; i < elements.length; i++) {
        elements[i].style.display = "none";
    }
  }
});

document.getElementById('showSimplified').addEventListener('change', function() {
  if (this.checked) {
    var elements = document.getElementsByClassName("simplified");
    for (var i = 0; i < elements.length; i++) {
        elements[i].style.display = "block";
    }
  } else {
    var elements = document.getElementsByClassName("simplified");
    for (var i = 0; i < elements.length; i++) {
        elements[i].style.display = "none";
    }
  }
});



window.onload = async function () {
  var url = "http://localhost:5000/get-session-keys";
  const session_keys_response = await fetch(url, { method: "POST" });
  result = await session_keys_response.json();

  var button = document.getElementById("myButton");

  if ("gpt3" in result) {
    button.classList.add("green-button");
    button.textContent = "GPT-3 ingesteld!";
  } else {
    button.classList.add("red-button");
    button.textContent = "GPT-3 niet ingesteld!";
  }

  if (!("personalized_settings" in result)) {
    alert(
      "U heeft geen instellingen aangepast. Ga eerst naar 'instellingen' en pas daar uw weergave aan."
    );
    return;
  } else {
    document.body.style.fontSize = result.personalized_settings.fontSize + "px";
    document.body.style.fontFamily = result.personalized_settings.fontSettings;
    document.body.style.backgroundColor = result.personalized_settings.favcolor;
    document.body.style.lineHeight =
      result.personalized_settings.lineHeight + "cm";
    document.body.style.wordSpacing =
      result.personalized_settings.wordSpacing + "cm";
    document.body.style.letterSpacing =
      result.personalized_settings.characterSpacing + "cm";
    document.body.style.textAlign = result.personalized_settings.textAlign;
  }

  let missing_keys = [];
  if (!("gpt3" in result)) {
    missing_keys.push("GPT-3");
    document.querySelector(".fixed-bottom").style.display = "none";
  }

  if (missing_keys.length > 0) {
    alert("Sleutel(s) voor " + missing_keys.join(" & ") + " ontbreken.");
    return;
  }
};
