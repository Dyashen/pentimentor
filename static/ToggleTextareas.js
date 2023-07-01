/* --- Toggle Text Input --- */
var element = document.getElementById("toggleFullTextScholars");
if (element) {
  element.addEventListener("change", function () {
    if (this.checked) {
      var textarea = document.createElement("textarea");
      textarea.name = "fullText";
      this.form.appendChild(textarea);
    } else {
      var textarea = this.form.querySelector('textarea[name="fullText"]');
      if (textarea) {
        textarea.remove();
      }
    }
  });
}

/* --- */
var element = document.getElementById("toggleFullTextTeachers");
if (element) {
  element.addEventListener("change", function () {
    if (this.checked) {
      var textarea = document.createElement("textarea");
      textarea.name = "fullText";
      this.form.appendChild(textarea);
    } else {
      var textarea = this.form.querySelector('textarea[name="fullText"]');
      if (textarea) {
        textarea.remove();
      }
    }
  });
}
