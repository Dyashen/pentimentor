window.onload = async function () {
    /* --- */
    var url = `http://localhost:5000/get-session-keys`;
    const response = await fetch(url, { method: "POST" });
  
    var result = await response.json();
  
    console.log(result);
  
    if (result.result && result.result == "session does not exist") {
      alert("U hebt niets ingesteld. Ga eerst naar 'instellingen' en pas daar uw weergave aan.");
      return;
    } 

    settings = result.personalized_settings
  
    document.body.style.fontSize        = settings.fontSize + "px";
    document.body.style.fontFamily      = settings.fontSettings;
    document.body.style.backgroundColor = settings.favcolor;
    document.body.style.lineHeight      = settings.lineHeight + "cm";
    document.body.style.wordSpacing     = settings.wordSpacing + "cm";
    document.body.style.letterSpacing   = settings.characterSpacing + "cm";
    document.body.style.textAlign       = settings.textAlign;

};