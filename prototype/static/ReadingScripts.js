function convertPTag(pTag, count) {
    let text = pTag.textContent;
    let words = text.split(' ');
    let container = document.createElement('div');
    container.className = '_' + String(count) + '_text_block';
    
    for (let word of words) {
      let span = document.createElement('span');
      span.textContent = word + ' ';
      container.appendChild(span);
    }
    
    pTag.parentNode.replaceChild(container, pTag);
  }
  
  

  window.addEventListener('load', function() {
    let pTagsLeft = document.querySelectorAll('.article-left p');
    let countLeft = 0;
  
    for (let pTag of pTagsLeft) {
      convertPTag(pTag, countLeft);
      countLeft++;
    }

    let pTagsRight = document.querySelectorAll('.article-right p');
    let countRight = 0;
  
    for (let pTag of pTagsRight) {
      convertPTag(pTag, countRight);
      countRight++;
    }
  });

window.onload = function() {

  function addToLocalstorage(event, definition) {
    const key = event.target.innerHTML;
    const existingValue = localStorage.getItem(key);
    if (existingValue) {
        const definitions = JSON.parse(existingValue);
        definitions.push(definition);
        localStorage.setItem(key, JSON.stringify(definitions));
    } else {
        localStorage.setItem(key, JSON.stringify([definition]));
    }
  }

  function showPentimento(event, value){
    alert(
      String(event.target.innerHTML) + ' ' + String(value)
    )
  }

  /*
    GPT-3 API hier toevoegen
  */
  function getDefinition(event) {
    const api_key = 'test';
    return api_key
  }

  function lookInLocalstorage(event){
    const key = event.target.innerHTML;
    const value = localStorage.getItem(key);
    if(value){
      showPentimento(event, value)
    } else {
      addToLocalstorage(event, getDefinition(event));
      lookInLocalstorage(event);
    }
  }

  const spanElements = document.querySelectorAll('span');
  spanElements.forEach(span => {
      span.addEventListener('click', lookInLocalstorage);
  });


  function getStartAndEnd(startContainer, endContainer){
    let startDiv = startContainer;
    while (startDiv && startDiv.nodeName !== 'DIV') {
      startDiv = startDiv.parentNode;
    }
    
    let endDiv = endContainer;
    while (endDiv && endDiv.nodeName !== 'DIV') {
        endDiv = endDiv.parentNode;
    }

    return([startDiv, endDiv]);
  }

  function changeBackgroundMarkedText(divs){

  }

  function getRewrittenText(text){
    console.log(text);
    return text;
  }


  const rewriteButton = document.querySelector('.rewrite');
  rewriteButton.addEventListener('click', () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const startContainer = range.startContainer;
        const endContainer = range.endContainer;

        var parentDiv = document.querySelector('.article-left');

        const rangeDivs = getStartAndEnd(startContainer, endContainer)
        const startRange = rangeDivs[0]

        if(!parentDiv.contains(startRange)){
          alert("Hier kan je geen tekst markeren. Markeer tekst in de linkerzijde van de pagina.")
          return
        }

        const endRange = rangeDivs[1]

        const int_text = startRange.innerText + endRange.innerText;

        const rightArticle = document.querySelector('.article-right');
        var childElements = rightArticle.querySelectorAll('.' + startRange.className);
        childElements[0].innerText = getRewrittenText(String(int_text))   
    }
  });
};