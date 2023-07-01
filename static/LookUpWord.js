//
document.addEventListener("DOMContentLoaded", () => {
  const spans = document.querySelectorAll(".word");
  spans.forEach((span) => {
    span.addEventListener("click", async (event) => {
      sentence_of_origin = span.closest(".sentence");
      var context = "";
      for (const child of sentence_of_origin.children) {
        context = context + " " + child.textContent;
      }

      const word = event.target.textContent;
      
      const response = await fetch(`http://localhost:5000/look-up-word`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({'word':word, 'sentence':sentence })
    });

    response = await response.json();

      var dazzle = document.querySelector(".dazzle");
      var p = document.createElement("p");
      var p2 = document.createElement("p");
    
      //
      if (response.source == 'Lexicala'){
        var prompt = document.createTextNode('Wat betekent ' +  word + ' in de zin ' + context +' ?');
        var text = '';
        response.result.results.forEach(function(element) {
          console.log(element.headword.pos)
          element.senses.forEach(function(definition){
            console.log(definition.definition);
            text += 'Deze ' + element.headword.pos + " heeft de volgende betekenissen:" + definition.definition + "'.\nDe bron van deze definities zijn: " + response.source + ".";
          })
        });
      } else if (response.source == 'gpt'){
        var prompt = document.createTextNode(response.prompt);
        text = response.result;
      } else {
        var prompt = document.createTextNode('');
        text = '';
      }
      
      var resultText = document.createTextNode(text);

      p.appendChild(prompt);
      dazzle.appendChild(p);
      p2.appendChild(resultText);
      dazzle.appendChild(p2);
    });
  });
});
