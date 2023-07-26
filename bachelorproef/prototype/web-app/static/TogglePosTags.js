/* Adjectieven uitfilteren op basis van span-tag */
function removeAdjectives() {
    const elements = document.querySelectorAll(".adj");
    elements.forEach(function (element) {
      element.remove();
    });
  }

  /* Checkboxes */
  const nouns = document.getElementById('noun-show');
  const verbs = document.getElementById('verb-show');
  const adjs = document.getElementById('adj-show');

  nouns.addEventListener('change', function () {
    if (this.checked) {
      const color = document.getElementById('colorForNouns').value;
      console.log(color);
      const elements = document.querySelectorAll("span.noun");
      elements.forEach(function (element) {
        element.style.color = color;
      });
    } else {
      const elements = document.querySelectorAll("span.noun");
      elements.forEach(function (element) {
        element.style.color = "black";
      });
    }
  });

  verbs.addEventListener('change', function () {
    if (this.checked) {
      const color = document.getElementById('colorForVerbs').value;
      const elements = document.querySelectorAll("span.verb, span.aux");
      console.log(color, elements[0])
      elements.forEach(function (element) {
        element.style.color = color;
      });
    } else {
      const elements = document.querySelectorAll("span.verb, span.aux");
      elements.forEach(function (element) {
        element.style.color = "black";
      });
    }
  });


  adjs.addEventListener('change', function () {
    if (this.checked) {
      const color = document.getElementById('colorForAdjs').value;
      const elements = document.querySelectorAll("span.adj");
      elements.forEach(function (element) {
        element.style.color = color;
      });
    } else {
      const elements = document.querySelectorAll("span.adj");
      elements.forEach(function (element) {
        element.style.color = "black";
      });
    }
  });