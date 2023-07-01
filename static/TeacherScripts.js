/* --- */
const checkbox = document.querySelector("#personalizedSummary");
const fieldsets = document.querySelectorAll(".personalized");
checkbox.addEventListener("change", () => {
  fieldsets.forEach((fieldset) => {
    if (checkbox && checkbox.checked) {
      fieldset.style.display = "block";
    } else {
      fieldset.style.display = "none";
    }
  });
});

/* Add word to glossary */
var checkboxAddWordToGlossary = document.getElementById(
  "checkboxAddWordToGlossary"
);
checkboxAddWordToGlossary.addEventListener("change", function () {
  if (checkboxAddWordToGlossary && checkboxAddWordToGlossary.checked) {
    const words = document.querySelectorAll(
      "span.verb, span.noun, span.aux, span.verb, span.adj"
    );
    words.forEach((w) => {
      w.addEventListener("click", async (event) => {
        if (checkboxAddWordToGlossary.checked) {
          var pTag = event.target;
          sentence_of_origin = w.closest("span.sentence");
          var context = "";
          for (const child of sentence_of_origin.children) {
            context = context + " " + child.textContent;
          }
          console.log(context);
          var textarea = document.getElementById("glossaryList");
          pTag.style.backgroundColor = "black";
          pTag.style.color = "white";
          pTag.style.fontWeight = "bold";
          textarea.value += pTag.innerHTML + ":" + context + "\n";
          console.log(textarea.value);
        }
      });
    });
  }
});

/* Deleting sentences */
const checkboxDeleteSents = document.getElementById("checkboxDeleteSents");
checkboxDeleteSents.addEventListener("change", function () {
  if (checkboxDeleteSents && checkboxDeleteSents.checked) {
    const sentences = document.querySelectorAll(".sentence");
    sentences.forEach((span) => {
      span.addEventListener("click", async (event) => {
        if (checkboxDeleteSents.checked) span.remove();
      });
    });
  }
});

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

window.onload = async function () {
  /* --- */
  localStorage.clear();
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
    document.getElementById("huggingface").innerHTML =
      "Geen HuggingFace sleutel werd opgegeven. ";
    document.getElementById("huggingface").style.color = "red";
  } else {
    document.getElementById("huggingface").innerHTML =
      "HuggingFace API-sleutel:\t" + result.hf_api_key;
  }

  if (result.gpt3 === undefined) {
    missing_keys.push("GPT-3");
    document.getElementById("gpt3").innerHTML =
      "Geen GPT-3 sleutel werd opgegeven.";
    document.getElementById("gpt3").style.color = "red";
  } else {
    document.getElementById("gpt3").innerHTML =
      "GPT-3 API-sleutel: " + result.gpt3;
  }

  if (missing_keys.length > 0) {
    alert("Sleutel(s) voor " + missing_keys.join(" & ") + " ontbreken.");
  }
};
