window.onload = async function () {
    /* --- */
    var url = `http://localhost:5000/get-settings-user`;
    const response = await fetch(url, { method: "POST" });
  
    var result = await response.json();
  
    console.log(result);
  
    if (result.result && result.result == "session does not exist") {
      alert("U hebt niets ingesteld. Ga eerst naar 'instellingen' en pas daar uw weergave aan.");
      return;
    } 
  
    document.body.style.fontSize = result.fontSize + "px";
    document.body.style.fontFamily = result.fontSettings;
    document.body.style.backgroundColor = result.favcolor;
    document.body.style.lineHeight = result.lineHeight + "cm";
    document.body.style.wordSpacing = result.wordSpacing + "cm";
    document.body.style.letterSpacing = result.characterSpacing + "cm";
    document.body.style.textAlign = result.textAlign;

};