function convertPTag(pTag, count) {
    let text = pTag.textContent;
    let words = text.split(' ');
    let container = document.createElement('div');
    container.className = String(count) + '_text_block';
    
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
  
  
  
  