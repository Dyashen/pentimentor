const colors = ['lightred', 'lightblue', 'lightgreen', 'lightyellow']

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
      span.style.backgroundColor = randomColor;

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

/* --- */
async function syntacticSimplification() {
  var selectedText = window.getSelection().toString();
  if (selectedText == "" || selectedText == null) {
    alert('Markeer de tekst die u wilt vereenvoudigen.');
    return;
  }

  var dazzle = document.querySelector(".dazzle");
  var p = document.createElement("p");
  var p2 = document.createElement("p");
  var text = document.createTextNode("Zinsbouw vereenvoudigen...");
  var prompt = document.createTextNode("...");
  p.appendChild(prompt);
  dazzle.appendChild(p);
  p2.appendChild(text);
  dazzle.appendChild(p2);
  const response = await fetch(`http://localhost:5000/simplify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: selectedText, key: "sc" }),
  });
  result = await response.json();
  prompt.nodeValue = JSON.stringify(result.prompt);
  text.nodeValue = JSON.stringify(result.result);
}

/* --- */
function insertAfter(newNode, existingNode) {
  existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
}

async function personalizedSimplification() {
  var selectedText = window.getSelection().toString();
  if (selectedText == "" || selectedText == null) {
    alert('Markeer de tekst die u wilt vereenvoudigen.');
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
    alert('Duidt één van de onderstaande opties aan.');
    return;
  }

  var selectedChoices = checkedValues;
  var prompt = document.createTextNode("Gepersonaliseerde tekst ophalen...");
  var text = document.createTextNode("...");
  var dazzle = document.querySelector(".dazzle");
  var p = document.createElement("p");
  var p2 = document.createElement("p");

  p.appendChild(prompt);
  dazzle.appendChild(p);
  p2.appendChild(text);
  dazzle.appendChild(p2);

  const response = await fetch(`http://localhost:5000/personalized-simplify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: selectedText, choices: selectedChoices }),
  });

  result = await response.json();

  array = result.result;
  console.log(array);

  if (array.length > 1) {
    prompt.nodeValue = JSON.stringify(result.prompt);
    const ul = document.createElement("ul");
    array.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      ul.appendChild(li);
    });
    text.remove;
    p2.appendChild(ul);
  } else {
    prompt.nodeValue = JSON.stringify(result.prompt);
    text.nodeValue = JSON.stringify(result.result[0]);
  }
}

async function askGPT() {
  var selectedText = window.getSelection().toString();
  if (selectedText == "" || selectedText == null) {
    alert('Markeer de tekst die u wilt vereenvoudigen.');
    return;
  }

  var promptText = window.prompt(
    "Wat wilt u doen met de geselecteerde tekst? Schrijf hier de prompt...'"
  );

  var fullPrompt = promptText + "///\n" + selectedText;
  var prompt = document.createTextNode("Gepersonaliseerde tekst ophalen...");
  var text = document.createTextNode("");
  var dazzle = document.querySelector(".dazzle");
  var p = document.createElement("p");
  var p2 = document.createElement("p");

  p.appendChild(prompt);
  dazzle.appendChild(p);
  p2.appendChild(text);
  dazzle.appendChild(p2);

  const response = await fetch(
    `http://localhost:5000/personalized-simplify-custom-prompt`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: selectedText, prompt: fullPrompt }),
    }
  );

  result = await response.json();
  console.log(result);
  prompt.nodeValue = JSON.stringify(result.prompt);
  text.nodeValue = JSON.stringify(result.result);
}

async function emptyChat() {
  const dazzleDiv = document.querySelector(".dazzle");
  dazzleDiv.innerHTML = "";
}

window.onload = async function () {
  /* --- */
  var url = `http://localhost:5000/get-settings-user`;
  const response = await fetch(url, { method: "POST" });
  var result = await response.json();
  document.body.style.fontSize = result.fontSize + "px";
  document.body.style.fontFamily = result.fontSettings;
  document.body.style.backgroundColor = result.favcolor;
  document.body.style.lineHeight = result.lineHeight + "cm";
  document.body.style.wordSpacing = result.wordSpacing + "cm";
  document.body.style.textAlign = result.textAlign;

  /* --- */
  var url = "http://localhost:5000/get-session-keys";
  const session_keys_response = await fetch(url, { method: "POST" });
  result = await session_keys_response.json();

  let missing_keys = [];

  if (result.hf_api_key === undefined) {
    missing_keys.push("HuggingFace");
    document.querySelector("#simple-syntactic-simplification").style.display =
      "none";
  }

  if (result.gpt3 === undefined) {
    missing_keys.push("GPT-3");
    document.querySelector("#prompt-synt-simplification").style.display =
      "none";
    document.querySelector("#personalized-synt-simplification").style.display =
      "none";
    document.querySelector(".personalisation").style.display = "none";
  }

  if (missing_keys.length > 0){
    alert("Sleutel(s) voor " + missing_keys.join(" & ") + " ontbreken.");
  }
};
