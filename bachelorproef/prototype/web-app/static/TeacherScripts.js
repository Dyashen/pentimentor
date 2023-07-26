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
