/* Tekst toevoegen */
function addTextToTextArea() {
  const fullTextBox = document.querySelector(".left-container").innerHTML;
  var textarea = document.getElementById("fullText");
  textarea.value = fullTextBox;
  document.getElementById("summarize-with-presets-button").disabled = false;
}

/* Tekst ophalen */
async function getSelectedText() {
  var selectedText = window.getSelection().toString();
  const textarea = document.querySelector("textarea");
  textarea.value = selectedText;
}

function makeTitle(button) {
  const titleText = document.getElementById("title").value;
  const newTitle = document.createElement("h3");
  newTitle.innerText = titleText;
  const titleContainer = document.getElementById("title").parentElement;
  titleContainer.replaceChild(newTitle, document.getElementById("title"));
  button.parentNode.removeChild(button);
}

function deleteTitle(button) {
  var parent = button.parentNode;
  parent.parentNode.removeChild(parent);
}

function addTextWithParagraph() {
  text = window.getSelection().toString();
  if (text == "") {
    return;
  } else {
    var fieldset = document.querySelector(".personalized");
    var inputs = fieldset.querySelectorAll("input");
    var values = [];
    for (var i = 0; i < inputs.length; i++) {
      if (inputs[i].type === "checkbox" && inputs[i].checked) {
        values.push(inputs[i].value);
      }
    }


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
          selectedTags.push(selectedElements[i]);
        }
      }
    }

    fullText = "";

    for (var i = 0; i < selectedTags.length; i++) {
      var tag = selectedTags[i];
      if (values.includes('summation')) {
        tag.style.backgroundColor = "#F0FFF0";
      } else if (values.includes('glossary')){
        tag.style.backgroundColor = "#F5DEB3";
      } else if (values.includes('table')) {
        tag.style.backgroundColor = "#FAFAD2";
      } else {
        tag.style.backgroundColor = "#F5F5DC";
      }
      
      var tagText = tag.textContent;
      tagText = tagText.split('\n').join('').replace(/:/g, "");
      fullText += tagText;
    }
    localStorage.setItem(fullText, values);
  }
}

function getAllLocalStorageValues() {
  var localStorageValues = {};
  for (var i = 0; i < localStorage.length; i++) {
    var key = localStorage.key(i);
    var value = localStorage.getItem(key);
    localStorageValues[key] = value;
  }
  return localStorageValues;
}

async function simplifyWithPresets() {
  var form = document.querySelector('form');
  var localStorageData = getAllLocalStorageValues();
  var input = document.createElement('input');
  input.type = 'hidden';
  input.name = 'text';
  input.value = JSON.stringify(localStorageData);
  form.appendChild(input);
  form.submit();
}

/* */
window.onload = async function () {
  localStorage.clear();
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